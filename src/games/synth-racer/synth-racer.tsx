import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, Trail, PerspectiveCamera, Environment, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from './store';
import { GameStatus } from './types';
import { audio } from './audio';

// --- Constants ---
const LANE_WIDTH = 4;
const SPEED_MULTIPLIER = 0.5;
const OBSTACLE_SPAWN_RATE = 0.02;

// --- Components ---

const Road = () => {
  const mesh = useRef<THREE.Mesh>(null);
  const { speed } = useStore();
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.position.z += speed * delta * SPEED_MULTIPLIER;
      if (mesh.current.position.z > 20) {
        mesh.current.position.z = 0;
      }
    }
  });

  return (
    <group>
      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} ref={mesh}>
        <planeGeometry args={[40, 400, 40, 400]} />
        <meshBasicMaterial color="#220033" wireframe />
      </mesh>
      {/* Horizon Sun */}
      <mesh position={[0, 10, -100]}>
        <circleGeometry args={[40, 32]} />
        <meshBasicMaterial color="#ff0055">
          <GradientTexture
            stops={[0, 1]}
            colors={['#ff0055', '#ffcc00']}
            size={1024}
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

const PlayerCar = () => {
  const { lane, speed } = useStore();
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth lane change
      const targetX = lane * LANE_WIDTH;
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, delta * 10);
      
      // Tilt based on turn
      const tilt = (targetX - ref.current.position.x) * -0.1;
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, tilt, delta * 10);
    }
  });

  return (
    <group ref={ref} position={[0, 0, 5]}>
      <Trail width={1} length={4} color="#00ffff" attenuation={(t) => t * t}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 0.5, 3]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </mesh>
      </Trail>
      {/* Wheels */}
      <mesh position={[-0.8, 0.25, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.8, 0.25, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.8, 0.25, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.8, 0.25, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};

const Obstacle = ({ position, onRemove }: { position: [number, number, number], onRemove: () => void }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { speed, status, endGame } = useStore();
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    if (status !== GameStatus.PLAYING) return;

    // Move towards player
    ref.current.position.z += (speed * SPEED_MULTIPLIER + 10) * delta;

    // Collision Check
    const playerZ = 5;
    const playerX = useStore.getState().lane * LANE_WIDTH; // Approximate, better to use ref but store is ok for simple check
    
    // Simple AABB
    if (Math.abs(ref.current.position.z - playerZ) < 2 && Math.abs(ref.current.position.x - playerX) < 1.5) {
      endGame();
      audio.playCrash();
    }

    // Remove if passed
    if (ref.current.position.z > 10) {
      onRemove();
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1.5, 1, 3]} />
      <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={0.8} />
    </mesh>
  );
};

const ObstacleManager = () => {
  const [obstacles, setObstacles] = useState<{ id: string, position: [number, number, number] }[]>([]);
  const { status, speed } = useStore();
  const timeSinceSpawn = useRef(0);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    timeSinceSpawn.current += delta;
    // Spawn rate increases with speed
    const spawnThreshold = Math.max(0.5, 2.0 - (speed / 40)); 

    if (timeSinceSpawn.current > spawnThreshold) {
      timeSinceSpawn.current = 0;
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const id = Math.random().toString(36).substr(2, 9);
      setObstacles(prev => [...prev, { id, position: [lane * LANE_WIDTH, 0.5, -100] }]);
    }
  });

  const removeObstacle = (id: string) => {
    setObstacles(prev => prev.filter(o => o.id !== id));
  };

  return (
    <>
      {obstacles.map(obs => (
        <Obstacle key={obs.id} position={obs.position} onRemove={() => removeObstacle(obs.id)} />
      ))}
    </>
  );
};

const HUD = () => {
  const { score, speed, status, startGame, resetGame } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic transform -skew-x-12">SYNTH RACER</h1>
          <div className="text-xs text-purple-400 tracking-widest">NEON HIGHWAY</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-cyan-400 italic">{Math.floor(score).toString().padStart(6, '0')}</div>
          <div className="text-xs text-purple-400 tracking-widest">SCORE</div>
        </div>
      </div>

      {/* Speedometer */}
      {status === GameStatus.PLAYING && (
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-6xl font-bold text-yellow-400 italic">{Math.round(speed * 3)} <span className="text-2xl">KM/H</span></div>
        </div>
      )}

      {/* Menu Overlay */}
      {status !== GameStatus.PLAYING && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
          <div className="text-center transform -skew-x-6 border-4 border-purple-500 p-12 bg-black/80 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
            <h2 className="text-7xl font-bold text-white mb-2 italic text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-pink-600">
              {status === GameStatus.GAME_OVER ? 'WIPEOUT' : 'READY?'}
            </h2>
            <p className="text-cyan-400 mb-8 tracking-widest text-xl">
              {status === GameStatus.GAME_OVER ? `FINAL SCORE: ${Math.floor(score)}` : 'DODGE TRAFFIC - SURVIVE THE GRID'}
            </p>
            <button
              onClick={status === GameStatus.GAME_OVER ? resetGame : startGame}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl italic tracking-widest hover:scale-110 transition-transform shadow-lg"
            >
              {status === GameStatus.GAME_OVER ? 'RETRY' : 'DRIVE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const GameLoop = () => {
  const { status, updateGame } = useStore();
  
  useFrame((state, delta) => {
    if (status === GameStatus.PLAYING) {
      updateGame(delta);
      audio.updateEngine(useStore.getState().speed);
    }
  });
  return null;
};

const SynthRacer = () => {
  const { status, setLane } = useStore();

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useStore.getState().status !== GameStatus.PLAYING) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(useStore.getState().lane - 1);
      if (e.key === 'ArrowRight' || e.key === 'd') setLane(useStore.getState().lane + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Audio Management
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      audio.startEngine();
      audio.playMusic();
    } else {
      audio.stopEngine();
      audio.stopMusic();
    }
    return () => {
      audio.stopEngine();
      audio.stopMusic();
    };
  }, [status]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <HUD />
      <Canvas shadows dpr={[1, 2]}>
        <GameLoop />
        <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={60} />
        <color attach="background" args={['#050011']} />
        <fog attach="fog" args={['#050011', 10, 100]} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Road />
        <PlayerCar />
        <ObstacleManager />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default SynthRacer;
