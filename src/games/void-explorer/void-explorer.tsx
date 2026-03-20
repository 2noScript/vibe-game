import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Stars, Trail, PerspectiveCamera, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useStore } from './store';
import { GameStatus } from './types';
import { v4 as uuidv4 } from 'uuid';
import { audio } from './audio';

// --- Constants ---
const SHIP_SPEED = 15;
const ASTEROID_SPAWN_RATE = 0.08;
const POWERUP_SPAWN_RATE = 0.01;
const ASTEROID_SPEED_BASE = 20;
const WORLD_WIDTH = 10;
const WORLD_HEIGHT = 6;

// --- Components ---

const Ship = () => {
  const ref = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const { status, health, shield, isBoosting, setBoosting } = useStore();
  const targetPos = useRef([0, 0, 0]);

  // Mouse/Touch controls
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      
      let clientX, clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;

      targetPos.current = [x * WORLD_WIDTH, y * WORLD_HEIGHT, 0];
    };

    const handleDown = () => setBoosting(true);
    const handleUp = () => setBoosting(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, [status, setBoosting]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const speedMult = isBoosting ? 2 : 1;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetPos.current[0], delta * SHIP_SPEED * speedMult);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetPos.current[1], delta * SHIP_SPEED * speedMult);
    
    ref.current.rotation.z = -ref.current.position.x * 0.05;
    ref.current.rotation.x = -ref.current.position.y * 0.05;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;

    if (shieldRef.current) {
      shieldRef.current.visible = shield > 0;
      shieldRef.current.rotation.y += delta;
      shieldRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.05);
    }

    (window as any).shipPosition = ref.current.position;
  });

  return (
    <group ref={ref}>
      <Float speed={5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {/* Ship Body */}
          <mesh>
            <coneGeometry args={[0.4, 1.5, 4]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Wings */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[1.5, 0.1, 0.5]} />
            <meshStandardMaterial color="#444" metalness={1} roughness={0.1} />
          </mesh>
          {/* Cockpit */}
          <mesh position={[0, 0.3, 0.1]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
        </group>
      </Float>

      {/* Engine Trails */}
      <Trail width={1.5} length={8} color="#00ffff" attenuation={(t) => t * t}>
        <mesh position={[0, 0, 0.5]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      </Trail>

      {/* Shield Visual */}
      <mesh ref={shieldRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshDistortMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.2} 
          distort={0.4} 
          speed={5} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight position={[0, 0, 1]} distance={5} intensity={isBoosting ? 10 : 5} color="#00ffff" />
    </group>
  );
};

const Explosion = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.scale.multiplyScalar(1.1);
    if (ref.current.scale.x > 5) setActive(false);
  });

  if (!active) return null;

  return (
    <group position={position} ref={ref}>
      <pointLight color="#ffaa00" intensity={10} distance={10} />
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

const Asteroid = ({ id, position, scale, speed, onRemove }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  const { status, takeDamage, addScore, isBoosting } = useStore();
  const [active, setActive] = useState(true);
  const [exploded, setExploded] = useState(false);

  useFrame((state, delta) => {
    if (!ref.current || !active) return;
    if (status !== GameStatus.PLAYING) return;

    const currentSpeed = isBoosting ? speed * 2 : speed;
    ref.current.position.z += currentSpeed * delta;
    
    ref.current.rotation.x += delta * 0.5;
    ref.current.rotation.y += delta * 0.5;

    const shipPos = (window as any).shipPosition;
    if (shipPos) {
      const dist = ref.current.position.distanceTo(shipPos);
      if (dist < 1.8) {
        takeDamage(25);
        audio.playImpact();
        setExploded(true);
        setActive(false);
        onRemove(id);
      }
    }

    if (ref.current.position.z > 10) {
      if (active) {
        addScore(10);
        audio.playScore();
      }
      setActive(false);
      onRemove(id);
    }
  });

  if (exploded) return <Explosion position={position} />;
  if (!active) return null;

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#333" roughness={1} metalness={0} />
    </mesh>
  );
};

const PowerUp = ({ id, position, type, onRemove }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  const { status, addShield, repair, isBoosting } = useStore();
  const [active, setActive] = useState(true);

  useFrame((state, delta) => {
    if (!ref.current || !active) return;
    if (status !== GameStatus.PLAYING) return;

    const speed = isBoosting ? 40 : 20;
    ref.current.position.z += speed * delta;
    ref.current.rotation.y += delta * 2;

    const shipPos = (window as any).shipPosition;
    if (shipPos) {
      const dist = ref.current.position.distanceTo(shipPos);
      if (dist < 2) {
        if (type === 'shield') addShield(50);
        else repair(30);
        audio.playPowerup();
        setActive(false);
        onRemove(id);
      }
    }

    if (ref.current.position.z > 10) {
      setActive(false);
      onRemove(id);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial 
        color={type === 'shield' ? '#00ffff' : '#ff00ff'} 
        emissive={type === 'shield' ? '#00ffff' : '#ff00ff'} 
        emissiveIntensity={2} 
      />
    </mesh>
  );
};

const AsteroidField = () => {
  const { status, speed } = useStore();
  const [entities, setEntities] = useState<any[]>([]);
  const lastSpawn = useRef(0);
  const lastPowerup = useRef(0);

  useFrame((state) => {
    if (status !== GameStatus.PLAYING) return;

    if (state.clock.elapsedTime - lastSpawn.current > ASTEROID_SPAWN_RATE) {
      lastSpawn.current = state.clock.elapsedTime;
      
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 15;
      const z = -60;
      const scale = 0.5 + Math.random() * 2;
      
      setEntities(prev => [...prev, {
        type: 'asteroid',
        id: uuidv4(),
        position: [x, y, z],
        scale: [scale, scale, scale],
        speed: speed + Math.random() * 15
      }]);
    }

    if (state.clock.elapsedTime - lastPowerup.current > 5) { // Spawn powerup every 5s
      lastPowerup.current = state.clock.elapsedTime;
      if (Math.random() < 0.3) {
        const x = (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 10;
        setEntities(prev => [...prev, {
          type: 'powerup',
          id: uuidv4(),
          position: [x, y, -60],
          powerupType: Math.random() > 0.5 ? 'shield' : 'repair'
        }]);
      }
    }
  });

  const removeEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      {entities.map(e => (
        e.type === 'asteroid' ? (
          <Asteroid key={e.id} {...e} onRemove={removeEntity} />
        ) : (
          <PowerUp key={e.id} {...e} type={e.powerupType} onRemove={removeEntity} />
        )
      ))}
    </>
  );
};

const HUD = () => {
  const { score, highScore, health, shield, multiplier, status, startGame, resetGame } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-10 z-10 font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-5xl font-black text-white tracking-tighter italic" style={{ textShadow: '0 0 20px #00ffff' }}>
            VOID<br/>EXPLORER
          </h1>
          <div className="flex gap-4">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 border-l-2 border-cyan-500">
              <div className="text-[10px] text-cyan-400 font-bold tracking-widest">MULTIPLIER</div>
              <div className="text-xl font-black text-white">x{multiplier.toFixed(1)}</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 border-l-2 border-yellow-500">
              <div className="text-[10px] text-yellow-400 font-bold tracking-widest">BEST</div>
              <div className="text-xl font-black text-white">{highScore.toString().padStart(6, '0')}</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-right"
        >
          <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            {score.toString().padStart(6, '0')}
          </div>
          <div className="text-xs text-cyan-400 font-bold tracking-[0.5em] uppercase mt-1">Current Score</div>
        </motion.div>
      </div>

      {/* Status Bars */}
      <div className="w-full max-w-2xl mx-auto space-y-4 mb-10">
        <AnimatePresence>
          {status === GameStatus.PLAYING && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="space-y-3"
            >
              {/* Shield Bar */}
              {shield > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-cyan-400 font-bold tracking-widest">
                    <span>SHIELD_CAPACITY</span>
                    <span>{Math.round(shield)}%</span>
                  </div>
                  <div className="h-1.5 bg-cyan-950/40 rounded-full overflow-hidden border border-cyan-500/20">
                    <motion.div 
                      className="h-full bg-cyan-400 shadow-[0_0_15px_#00ffff]"
                      initial={{ width: 0 }}
                      animate={{ width: `${shield}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hull Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-red-400 font-bold tracking-widest">
                  <span>HULL_INTEGRITY</span>
                  <span>{Math.round(health)}%</span>
                </div>
                <div className="h-2 bg-red-950/40 rounded-full overflow-hidden border border-red-500/20">
                  <motion.div 
                    className="h-full bg-red-500 shadow-[0_0_15px_#ff0000]"
                    initial={{ width: 0 }}
                    animate={{ width: `${health}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {status !== GameStatus.PLAYING && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl pointer-events-auto"
          >
            <div className="text-center space-y-10 relative">
              <div className="absolute -inset-20 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
              
              <div className="space-y-2">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-8xl font-black text-white tracking-tighter italic"
                  style={{ textShadow: '0 0 30px #00ffff' }}
                >
                  {status === GameStatus.GAME_OVER ? 'SIGNAL_LOST' : 'VOID_RUNNER'}
                </motion.h2>
                <p className="text-cyan-400 tracking-[0.5em] text-xs font-bold uppercase">
                  {status === GameStatus.GAME_OVER ? 'Critical Hull Failure Detected' : 'Deep Space Exploration Protocol'}
                </p>
              </div>

              {status === GameStatus.GAME_OVER && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/5 backdrop-blur-md p-6 border border-white/10 rounded-lg"
                >
                  <div className="text-xs text-white/40 mb-1">RECOVERED_DATA</div>
                  <div className="text-5xl font-black text-yellow-400">{score.toLocaleString()}</div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={status === GameStatus.GAME_OVER ? resetGame : startGame}
                className="group relative px-16 py-5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-cyan-500 skew-x-[-20deg] group-hover:bg-white transition-colors duration-300" />
                <span className="relative text-black font-black text-2xl tracking-widest">
                  {status === GameStatus.GAME_OVER ? 'REBOOT' : 'INITIATE'}
                </span>
              </motion.button>
              
              <p className="text-[10px] text-white/20 tracking-widest uppercase">
                Hold mouse/tap to engage emergency thrusters
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VoidExplorer = () => {
  const { status } = useStore();

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      audio.startEngine();
      audio.playStart();
    } else {
      audio.stopEngine();
      if (status === GameStatus.GAME_OVER) {
        audio.playGameOver();
      }
    }
    
    return () => {
      audio.stopEngine();
    };
  }, [status]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <HUD />
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ 
          antialias: false, 
          stencil: false, 
          depth: true,
          powerPreference: 'high-performance'
        }}
        dpr={window.devicePixelRatio}
      >
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 10, 60]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ff00ff" />
        
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={2} />
        
        <Ship />
        <AsteroidField />

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4}
          />
          <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,6px_100%]" />
    </div>
  );
};

export default VoidExplorer;
