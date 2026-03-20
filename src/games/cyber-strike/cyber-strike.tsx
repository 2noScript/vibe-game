import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useStore, GameStatus } from './store';
import { audio } from './audio';
import { 
  createPixelTexture, 
  PLAYER_SHIP_PIXELS, 
  ENEMY_DRONE_PIXELS, 
  ENEMY_INTERCEPTOR_PIXELS,
  ENEMY_TURRET_PIXELS,
  BOSS_PIXELS,
  BULLET_PIXELS, 
  ENEMY_BULLET_PIXELS,
  POWERUP_SPREAD_PIXELS,
  POWERUP_RAPID_PIXELS,
  COLOR_MAP 
} from './texture-generator';

// --- Constants ---
const GAME_WIDTH = 160;
const GAME_HEIGHT = 144;
const PLAYER_SPEED = 100; // Slightly faster for "pro" feel
const BULLET_SPEED = 180;
const ENEMY_SPEED_DRONE = 45;
const ENEMY_SPEED_INTERCEPTOR = 75;
const ENEMY_SPEED_TURRET = 25;
const SPAWN_RATE = 1.0;

// --- Types ---
type EntityType = 'player' | 'enemy_drone' | 'enemy_interceptor' | 'enemy_turret' | 'boss' | 'bullet_player' | 'bullet_enemy' | 'powerup_spread' | 'powerup_rapid' | 'explosion';

interface EntityData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: EntityType;
  active: boolean;
  hp: number;
  maxHp?: number;
  fireTimer?: number;
  rotation?: number;
  scale?: number;
  life?: number;
}

// --- Components ---

const PixelSprite: React.FC<{ 
  texture: THREE.Texture, 
  entity: EntityData, 
  color?: string 
}> = ({ texture, entity, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && entity.active) {
      meshRef.current.position.set(entity.x, entity.y, 0);
      
      if (entity.type === 'explosion') {
        entity.life = (entity.life || 1) - delta * 3;
        if (entity.life <= 0) entity.active = false;
        meshRef.current.scale.setScalar(1 + (1 - entity.life) * 2);
        if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
          meshRef.current.material.opacity = entity.life;
        }
      }
      
      if (entity.type === 'player') {
        meshRef.current.rotation.y = (entity.vx / PLAYER_SPEED) * 0.5;
        meshRef.current.rotation.z = (entity.vx / PLAYER_SPEED) * -0.2;
      }
    } else if (meshRef.current && !entity.active) {
      meshRef.current.visible = false;
    }
  });

  if (!entity.active) return null;

  return (
    <mesh ref={meshRef} position={[entity.x, entity.y, 0]} rotation={[0, 0, entity.rotation || 0]}>
      <planeGeometry args={[entity.width, entity.height]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        color={color || 'white'} 
        toneMapped={false}
      />
    </mesh>
  );
};

const GameLoop: React.FC<{ 
  textures: Record<string, THREE.Texture>
}> = ({ textures }) => {
  const { 
    status, 
    level,
    weaponLevel,
    addScore, 
    takeDamage, 
    setStatus, 
    nextLevel, 
    upgradeWeapon,
    setBossHealth 
  } = useStore();
  
  const { camera } = useThree();
  
  // Game State Ref (Mutable)
  const gameState = useRef<{
    entities: EntityData[];
    lastSpawn: number;
    lastShot: number;
    keys: Record<string, boolean>;
    levelTime: number;
    enemiesSpawned: number;
    bossSpawned: boolean;
    shake: number;
  }>({
    entities: [],
    lastSpawn: 0,
    lastShot: 0,
    keys: {},
    levelTime: 0,
    enemiesSpawned: 0,
    bossSpawned: false,
    shake: 0,
  });

  // Force re-render for entity list changes
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      audio.init();
      gameState.current.keys[e.key] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize / Reset
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      audio.init();
      audio.startBGM();
      // Only reset player if starting fresh or restarting, but we want to keep player between levels?
      // For now, simple reset logic. Ideally, we persist player state.
      // But let's reset position for each level start for simplicity.
      
      const playerExists = gameState.current.entities.find(e => e.type === 'player');
      
      if (!playerExists) {
          gameState.current.entities = [{
            id: 'player',
            x: 0,
            y: -GAME_HEIGHT / 2 + 20,
            vx: 0,
            vy: 0,
            width: 7,
            height: 5,
            type: 'player',
            active: true,
            hp: 1
          }];
      } else {
          // Reset position
          playerExists.x = 0;
          playerExists.y = -GAME_HEIGHT / 2 + 20;
          playerExists.active = true;
      }
      
      gameState.current.lastSpawn = 0;
      gameState.current.lastShot = 0;
      gameState.current.levelTime = 0;
      gameState.current.enemiesSpawned = 0;
      gameState.current.bossSpawned = false;
      forceUpdate();
    }
  }, [status, forceUpdate]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.BOSS_FIGHT) return;

    const time = state.clock.elapsedTime;
    const { entities, keys } = gameState.current;
    let needsUpdate = false;
    
    gameState.current.levelTime += delta;

    // Screen Shake
    if (gameState.current.shake > 0) {
      gameState.current.shake -= delta * 10;
      camera.position.x = (Math.random() - 0.5) * gameState.current.shake;
      camera.position.y = (Math.random() - 0.5) * gameState.current.shake;
    } else {
      camera.position.x = 0;
      camera.position.y = 0;
    }

    // --- Player Logic ---
    const player = entities.find(e => e.type === 'player');
    if (player && player.active) {
      let dx = 0;
      let dy = 0;
      if (keys['ArrowLeft'] || keys['a']) dx -= 1;
      if (keys['ArrowRight'] || keys['d']) dx += 1;
      if (keys['ArrowUp'] || keys['w']) dy += 1;
      if (keys['ArrowDown'] || keys['s']) dy -= 1;
      
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx /= len;
        dy /= len;
      }

      player.vx = dx * PLAYER_SPEED;
      player.vy = dy * PLAYER_SPEED;

      // Shooting
      const fireRate = weaponLevel >= 3 ? 0.1 : 0.15;
      if ((keys[' '] || keys['Enter']) && time - gameState.current.lastShot > fireRate) {
        gameState.current.lastShot = time;
        audio.playShoot();
        
        // Weapon Logic
        if (weaponLevel === 1) {
            entities.push({
                id: `bullet-${Math.random()}`,
                x: player.x,
                y: player.y + 4,
                vx: 0,
                vy: BULLET_SPEED,
                width: 1,
                height: 2,
                type: 'bullet_player',
                active: true,
                hp: 1
            });
        } else if (weaponLevel >= 2) {
            // Spread Shot
            [-0.3, 0, 0.3].forEach(angle => {
                entities.push({
                    id: `bullet-${Math.random()}`,
                    x: player.x,
                    y: player.y + 4,
                    vx: Math.sin(angle) * BULLET_SPEED,
                    vy: Math.cos(angle) * BULLET_SPEED,
                    width: 1,
                    height: 2,
                    type: 'bullet_player',
                    active: true,
                    hp: 1
                });
            });
        }
        
        needsUpdate = true;
      }
    }

    // --- Level Spawning Logic ---
    // Level 1: Drones only
    // Level 2: Drones + Interceptors
    // Level 3: Drones + Interceptors + Turrets + BOSS
    
    const spawnRate = Math.max(0.5, SPAWN_RATE - (level * 0.2));
    const maxEnemies = 20 + (level * 10);
    
    if (status === GameStatus.PLAYING) {
        if (gameState.current.enemiesSpawned < maxEnemies) {
            if (time - gameState.current.lastSpawn > spawnRate) {
                gameState.current.lastSpawn = time;
                gameState.current.enemiesSpawned++;
                
                const x = (Math.random() - 0.5) * (GAME_WIDTH - 20);
                let type: EntityType = 'enemy_drone';
                let speed = ENEMY_SPEED_DRONE;
                let hp = 1;
                let width = 7;
                let height = 5;
                
                const rand = Math.random();
                
                if (level >= 2 && rand > 0.6) {
                    type = 'enemy_interceptor';
                    speed = ENEMY_SPEED_INTERCEPTOR;
                    hp = 2;
                    width = 5;
                    height = 5;
                }
                
                if (level >= 3 && rand > 0.8) {
                    type = 'enemy_turret';
                    speed = ENEMY_SPEED_TURRET;
                    hp = 4;
                    width = 7;
                    height = 7;
                }

                entities.push({
                    id: `enemy-${Math.random()}`,
                    x: x,
                    y: GAME_HEIGHT / 2 + 10,
                    vx: type === 'enemy_interceptor' ? (Math.random() - 0.5) * 40 : (Math.random() - 0.5) * 10,
                    vy: -speed,
                    width,
                    height,
                    type,
                    active: true,
                    hp,
                    fireTimer: 0
                });
                needsUpdate = true;
            }
        } else if (entities.filter(e => e.type.startsWith('enemy')).length === 0) {
            // All enemies cleared
            if (level < 3) {
                setStatus(GameStatus.LEVEL_COMPLETE);
            } else if (!gameState.current.bossSpawned) {
                // Spawn Boss
                setStatus(GameStatus.BOSS_FIGHT);
                gameState.current.bossSpawned = true;
                
                const maxBossHp = 100;
                setBossHealth(maxBossHp, maxBossHp);
                
                entities.push({
                    id: 'boss',
                    x: 0,
                    y: GAME_HEIGHT / 2 + 30, // Start off screen
                    vx: 0,
                    vy: -10, // Move down slowly
                    width: 20,
                    height: 16,
                    type: 'boss',
                    active: true,
                    hp: maxBossHp,
                    maxHp: maxBossHp,
                    fireTimer: 0
                });
                needsUpdate = true;
            }
        }
    }

    // --- Physics & AI ---
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (!e.active) continue;

      // Boss Logic
      if (e.type === 'boss') {
          if (e.y > GAME_HEIGHT / 4) {
              e.y += e.vy * delta; // Move into position
          } else {
              // Hover pattern
              e.x = Math.sin(time) * 40;
              e.y = GAME_HEIGHT / 4 + Math.cos(time * 2) * 5;
              
              // Boss Shooting
              e.fireTimer = (e.fireTimer || 0) + delta;
              if (e.fireTimer > 1.5) {
                  e.fireTimer = 0;
                  audio.playEnemyShoot();
                  // Fan shot
                  [-0.5, -0.25, 0, 0.25, 0.5].forEach(angle => {
                      entities.push({
                          id: `bullet-boss-${Math.random()}`,
                          x: e.x,
                          y: e.y - 10,
                          vx: Math.sin(angle) * BULLET_SPEED,
                          vy: -BULLET_SPEED,
                          width: 2,
                          height: 2,
                          type: 'bullet_enemy',
                          active: true,
                          hp: 1
                      });
                  });
                  needsUpdate = true;
              }
          }
          // Update Boss Health UI
          setBossHealth(e.hp);
      } 
      // Turret Logic
      else if (e.type === 'enemy_turret') {
          e.x += e.vx * delta;
          e.y += e.vy * delta;
          
          e.fireTimer = (e.fireTimer || 0) + delta;
          if (e.fireTimer > 2.0 && player) {
              e.fireTimer = 0;
              audio.playEnemyShoot();
              // Aim at player
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              entities.push({
                  id: `bullet-enemy-${Math.random()}`,
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(angle) * (BULLET_SPEED * 0.6),
                  vy: Math.sin(angle) * (BULLET_SPEED * 0.6),
                  width: 2,
                  height: 2,
                  type: 'bullet_enemy',
                  active: true,
                  hp: 1
              });
              needsUpdate = true;
          }
      }
      else {
          e.x += e.vx * delta;
          e.y += e.vy * delta;
      }

      // Bounds Check
      if (e.type === 'player') {
        e.x = Math.max(-GAME_WIDTH/2 + e.width/2, Math.min(GAME_WIDTH/2 - e.width/2, e.x));
        e.y = Math.max(-GAME_HEIGHT/2 + e.height/2, Math.min(GAME_HEIGHT/2 - e.height/2, e.y));
      } else if (e.y < -GAME_HEIGHT/2 - 20 || e.y > GAME_HEIGHT/2 + 20 || e.x < -GAME_WIDTH/2 - 20 || e.x > GAME_WIDTH/2 + 20) {
        e.active = false;
        entities.splice(i, 1);
        needsUpdate = true;
      }
    }

    // --- Collision ---
    const activeBullets = entities.filter(e => e.type === 'bullet_player' && e.active);
    const enemyBullets = entities.filter(e => e.type === 'bullet_enemy' && e.active);
    const activeEnemies = entities.filter(e => (e.type.startsWith('enemy') || e.type === 'boss') && e.active);
    const powerups = entities.filter(e => e.type.startsWith('powerup') && e.active);

    // Player Bullets vs Enemies
    activeBullets.forEach(b => {
      activeEnemies.forEach(e => {
        if (!b.active || !e.active) return;
        if (Math.abs(b.x - e.x) < (b.width + e.width)/2 && Math.abs(b.y - e.y) < (b.height + e.height)/2) {
          b.active = false;
          e.hp -= 1;
          
          if (e.hp <= 0) {
              e.active = false;
              addScore(e.type === 'boss' ? 5000 : 100);
              gameState.current.shake = e.type === 'boss' ? 10 : 3;
              audio.playExplosion(e.type === 'boss');

              // Explosion
              entities.push({
                id: `explosion-${Math.random()}`,
                x: e.x,
                y: e.y,
                vx: 0,
                vy: 0,
                width: e.width * 1.5,
                height: e.height * 1.5,
                type: 'explosion',
                active: true,
                hp: 1,
                life: 1
              });
              
              // Drop Powerup Chance
              if (Math.random() > 0.9 && e.type !== 'boss') {
                  entities.push({
                      id: `powerup-${Math.random()}`,
                      x: e.x,
                      y: e.y,
                      vx: 0,
                      vy: -20,
                      width: 5,
                      height: 5,
                      type: Math.random() > 0.5 ? 'powerup_spread' : 'powerup_rapid',
                      active: true,
                      hp: 1
                  });
              }

              // Boss Defeated
              if (e.type === 'boss') {
                  setStatus(GameStatus.VICTORY);
              }
              
              const eIdx = entities.indexOf(e);
              if (eIdx > -1) entities.splice(eIdx, 1);
          }
          
          // Remove bullet
          const bIdx = entities.indexOf(b);
          if (bIdx > -1) entities.splice(bIdx, 1);
          
          needsUpdate = true;
        }
      });
    });

    // Player vs Enemy Bullets / Enemies / Powerups
    if (player && player.active) {
      // Vs Enemy Bullets
      enemyBullets.forEach(b => {
          if (!b.active) return;
          if (Math.abs(player.x - b.x) < (player.width + b.width)/2 && Math.abs(player.y - b.y) < (player.height + b.height)/2) {
              b.active = false;
              takeDamage();
              audio.playHit();
              gameState.current.shake = 5;
              const bIdx = entities.indexOf(b);
              if (bIdx > -1) entities.splice(bIdx, 1);
              needsUpdate = true;
          }
      });

      // Vs Enemies (Collision)
      activeEnemies.forEach(e => {
        if (!e.active) return;
        if (Math.abs(player.x - e.x) < (player.width + e.width)/2 && Math.abs(player.y - e.y) < (player.height + e.height)/2) {
          e.active = false;
          takeDamage();
          audio.playHit();
          gameState.current.shake = 8;
          const eIdx = entities.indexOf(e);
          if (eIdx > -1) entities.splice(eIdx, 1);
          needsUpdate = true;
        }
      });

      // Vs Powerups
      powerups.forEach(p => {
          if (!p.active) return;
          if (Math.abs(player.x - p.x) < (player.width + p.width)/2 && Math.abs(player.y - p.y) < (player.height + p.height)/2) {
              p.active = false;
              upgradeWeapon();
              audio.playPowerup();
              addScore(50);
              const pIdx = entities.indexOf(p);
              if (pIdx > -1) entities.splice(pIdx, 1);
              needsUpdate = true;
          }
      });
    }

    if (needsUpdate) forceUpdate();
  });

  return (
    <>
      {gameState.current.entities.map(e => {
        let tex = textures.player;
        if (e.type === 'enemy_drone') tex = textures.drone;
        if (e.type === 'enemy_interceptor') tex = textures.interceptor;
        if (e.type === 'enemy_turret') tex = textures.turret;
        if (e.type === 'boss') tex = textures.boss;
        if (e.type === 'bullet_player') tex = textures.bullet;
        if (e.type === 'bullet_enemy') tex = textures.enemyBullet;
        if (e.type === 'powerup_spread') tex = textures.powerupSpread;
        if (e.type === 'powerup_rapid') tex = textures.powerupRapid;
        if (e.type === 'explosion') tex = textures.explosion;
        
        return <PixelSprite key={e.id} texture={tex} entity={e} />;
      })}
    </>
  );
};

// ... Background component remains same ...
const Background: React.FC = () => {
  const stars = useMemo(() => {
    const temp = [];
    for(let i=0; i<150; i++) {
      temp.push({
        x: (Math.random() - 0.5) * GAME_WIDTH,
        y: (Math.random() - 0.5) * GAME_HEIGHT,
        z: -10,
        size: Math.random() > 0.8 ? 1.2 : 0.6,
        speed: Math.random() * 30 + 10
      });
    }
    return temp;
  }, []);

  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    stars.forEach((star, i) => {
      star.y -= star.speed * delta;
      if (star.y < -GAME_HEIGHT/2) star.y = GAME_HEIGHT/2;
      
      dummy.position.set(star.x, star.y, star.z);
      dummy.scale.set(star.size, star.size, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 150]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#888888" />
    </instancedMesh>
  );
};

const HUD: React.FC = () => {
  const { score, lives, status, level, bossHealth, maxBossHealth, startGame, restartGame, nextLevel } = useStore();
  
  useEffect(() => {
    if (status === GameStatus.LEVEL_COMPLETE) {
      audio.stopBGM();
      audio.playLevelClear();
    } else if (status === GameStatus.GAME_OVER) {
      audio.stopBGM();
      audio.playGameOver();
    } else if (status === GameStatus.VICTORY) {
      audio.stopBGM();
      audio.playLevelClear();
    }
  }, [status]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 font-mono text-white select-none">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-start w-full"
      >
        <div className="flex flex-col bg-black/40 backdrop-blur-md p-3 border-l-4 border-cyan-500 rounded-r-lg">
          <span className="text-[10px] text-cyan-400 tracking-[0.3em] font-bold">SYSTEM_SCORE</span>
          <span className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {score.toString().padStart(7, '0')}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
            <div className="bg-black/40 backdrop-blur-md px-4 py-1 border border-yellow-500/30 rounded-full mb-2">
              <span className="text-[10px] text-yellow-400 tracking-[0.4em] font-bold uppercase">Sector {level}</span>
            </div>
            {status === GameStatus.BOSS_FIGHT && (
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="w-48 h-3 bg-red-950/60 border border-red-500/50 rounded-sm overflow-hidden backdrop-blur-md"
                >
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                        style={{ width: `${(bossHealth / maxBossHealth) * 100}%` }}
                    />
                </motion.div>
            )}
        </div>

        <div className="flex flex-col items-end bg-black/40 backdrop-blur-md p-3 border-r-4 border-red-500 rounded-l-lg">
          <span className="text-[10px] text-red-400 tracking-[0.3em] font-bold">SHIELD_INTEGRITY</span>
          <div className="flex space-x-2 mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ 
                  backgroundColor: i < lives ? '#ef4444' : 'transparent',
                  scale: i < lives ? 1 : 0.8,
                  opacity: i < lives ? 1 : 0.2
                }}
                className="w-5 h-2 border border-red-500/50 skew-x-[-20deg]" 
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Menus */}
      <AnimatePresence>
        {status === GameStatus.MENU && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto backdrop-blur-xl"
          >
            <div className="text-center space-y-12 relative">
              <div className="absolute -inset-20 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
              
              <div className="space-y-2 relative">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-7xl md:text-9xl font-black text-white tracking-tighter italic"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500">CYBER</span>
                  <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600">STRIKE</span>
                </motion.h1>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <p className="text-cyan-400/60 text-[10px] tracking-[0.5em] font-bold uppercase animate-pulse">
                  // Initialize combat protocol //
                </p>
                <button 
                  onClick={() => {
                    audio.playClick();
                    startGame();
                  }}
                  className="group relative px-12 py-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-cyan-500 skew-x-[-20deg] group-hover:bg-white transition-colors duration-300" />
                  <span className="relative text-black font-black text-xl tracking-widest group-hover:text-cyan-600 transition-colors duration-300">
                    ENGAGE
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {status === GameStatus.LEVEL_COMPLETE && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-md"
          >
            <div className="text-center space-y-8">
              <motion.h2 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-green-400 tracking-tighter italic"
              >
                SECTOR_CLEARED
              </motion.h2>
              <p className="text-white/60 tracking-[0.3em] text-xs">SYNCHRONIZING NEXT WAVE...</p>
              <button 
                onClick={() => {
                  audio.playClick();
                  nextLevel();
                }}
                className="px-12 py-4 bg-green-500 text-black font-black text-xl skew-x-[-20deg] hover:bg-white transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              >
                PROCEED
              </button>
            </div>
          </motion.div>
        )}

        {status === GameStatus.GAME_OVER && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/95 pointer-events-auto backdrop-blur-xl"
          >
            <div className="text-center space-y-8">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-7xl font-black text-red-600 tracking-tighter italic drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              >
                SYSTEM_FAILURE
              </motion.h2>
              <div className="space-y-2">
                <p className="text-white/40 text-xs tracking-widest uppercase">Final Data Log</p>
                <div className="text-4xl font-black text-yellow-400">{score.toLocaleString()}</div>
              </div>
              <button 
                onClick={() => {
                  audio.playClick();
                  restartGame();
                }}
                className="px-12 py-4 bg-red-600 text-white font-black text-xl skew-x-[-20deg] hover:bg-white hover:text-red-600 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              >
                REBOOT
              </button>
            </div>
          </motion.div>
        )}
        
        {status === GameStatus.VICTORY && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/95 pointer-events-auto backdrop-blur-xl"
          >
            <div className="text-center space-y-8">
              <motion.h2 
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-black text-yellow-400 tracking-tighter italic drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]"
              >
                MISSION_COMPLETE
              </motion.h2>
              <p className="text-cyan-400 tracking-[0.4em] text-xs font-bold uppercase">Mainframe secured. Threat neutralized.</p>
              <div className="text-5xl font-black text-white">{score.toLocaleString()}</div>
              <button 
                onClick={() => {
                  audio.playClick();
                  restartGame();
                }}
                className="px-12 py-4 bg-yellow-500 text-black font-black text-xl skew-x-[-20deg] hover:bg-white transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)]"
              >
                NEW_MISSION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CyberStrike: React.FC = () => {
  // Textures
  const textures = useMemo(() => ({
      player: createPixelTexture(PLAYER_SHIP_PIXELS, COLOR_MAP),
      drone: createPixelTexture(ENEMY_DRONE_PIXELS, COLOR_MAP),
      interceptor: createPixelTexture(ENEMY_INTERCEPTOR_PIXELS, COLOR_MAP),
      turret: createPixelTexture(ENEMY_TURRET_PIXELS, COLOR_MAP),
      boss: createPixelTexture(BOSS_PIXELS, COLOR_MAP),
      bullet: createPixelTexture(BULLET_PIXELS, COLOR_MAP),
      enemyBullet: createPixelTexture(ENEMY_BULLET_PIXELS, COLOR_MAP),
      powerupSpread: createPixelTexture(POWERUP_SPREAD_PIXELS, COLOR_MAP),
      powerupRapid: createPixelTexture(POWERUP_RAPID_PIXELS, COLOR_MAP),
      explosion: createPixelTexture(["WWW","WWW","WWW"], COLOR_MAP),
  }), []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <HUD />
      <Canvas
        orthographic
        camera={{ zoom: 4, position: [0, 0, 100] }}
        dpr={window.devicePixelRatio} 
        gl={{ antialias: false, stencil: false, depth: false }} 
        style={{ imageRendering: 'pixelated' }}
      >
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.5} />
        <Background />
        <GameLoop textures={textures} />
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,6px_100%]" />
      <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-cyan-500/5 to-transparent h-full opacity-20" />
    </div>
  );
};

export default CyberStrike;
