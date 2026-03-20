import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playShootSound, playHitSound, playDeathSound, playPlantSound } from './audio';
import { PlantType, ZombieType, Plant, Zombie, Projectile, FloatingText as FloatingTextType, Sun as SunType, PLANT_DATA } from './types';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, INITIAL_SUN, ZOMBIE_SPAWN_INTERVAL, SUN_SPAWN_INTERVAL } from './constants';
import { HUD } from './components/hud';
import { PlantCard } from './components/plant-card';
import { Zombie as ZombieComponent } from './components/zombie';
import { Projectile as ProjectileComponent } from './components/projectile';
import { Sun as SunComponent } from './components/sun';
import { GridCell } from './components/grid-cell';
import { Overlay } from './components/overlay';
import { FloatingText } from './components/floating-text';

import { useGameStore } from './store';

const ZombiePlant: React.FC = () => {
  const {
    gameState, sun, plants, zombies, projectiles, suns,
    selectedPlant, isShovelSelected, screenShake,
    setGameState, setSun, setScore, setPlants, setZombies, setProjectiles, setSuns,
    setSelectedPlant, setIsShovelSelected, setWaveProgress,
    triggerShake, addFloatingText
  } = useGameStore();
  
  const gameLoopRef = useRef<number | null>(null);
  const lastZombieSpawnRef = useRef<number>(0);
  const lastSunSpawnRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  // Refs to avoid stale closures in the game loop
  const zombiesRef = useRef<Zombie[]>([]);
  const plantsRef = useRef<Plant[]>([]);
  
  useEffect(() => {
    zombiesRef.current = zombies;
  }, [zombies]);
  
  useEffect(() => {
    plantsRef.current = plants;
  }, [plants]);

  const spawnZombie = useCallback(() => {
    useGameStore.getState().spawnZombie();
  }, []);

  const spawnSun = useCallback(() => {
    useGameStore.getState().spawnSun();
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;

    if (isShovelSelected) {
      const plantToRemove = plants.find(p => p.row === row && p.col === col);
      if (plantToRemove) {
        setPlants(prev => prev.filter(p => p.id !== plantToRemove.id));
        playDeathSound();
        addFloatingText(col * CELL_SIZE + 40, row * CELL_SIZE + 40, "REMOVED", "text-zinc-400");
      }
      return;
    }

    if (!selectedPlant) return;

    if (plants.some(p => p.row === row && p.col === col)) return;

    const cost = PLANT_DATA[selectedPlant].cost;
    if (sun < cost) return;

    const newPlant: Plant = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedPlant,
      row,
      col,
      health: PLANT_DATA[selectedPlant].health,
      maxHealth: PLANT_DATA[selectedPlant].health,
      lastShot: Date.now(),
    };

    setSun(prev => prev - cost);
    setPlants(prev => [...prev, newPlant]);
    playPlantSound();

    if (selectedPlant === 'cherry') {
      setTimeout(() => {
        setZombies(prev => {
          let hit = false;
          const updated = prev.filter(z => {
            const dist = Math.sqrt(Math.pow(z.x - col * CELL_SIZE, 2) + Math.pow(z.row * CELL_SIZE - row * CELL_SIZE, 2));
            if (dist < 150) {
              hit = true;
              setScore(s => s + 200);
              return false;
            }
            return true;
          });
          if (hit) {
            triggerShake();
            playDeathSound();
          }
          return updated;
        });
        setPlants(prev => prev.filter(p => p.id !== newPlant.id));
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const update = () => {
      const now = Date.now();
      const currentZombies = zombiesRef.current;
      const currentPlants = plantsRef.current;
      
      // Update wave progress (0 to 100 over 2 minutes for a level)
      const elapsed = now - startTimeRef.current;
      const progress = Math.min((elapsed / 120000) * 100, 100);
      setWaveProgress(progress);

      // Dynamic difficulty: Spawning gets faster as wave progress increases
      const currentSpawnInterval = Math.max(ZOMBIE_SPAWN_INTERVAL - (progress * 30), 1000);
      if (now - lastZombieSpawnRef.current > currentSpawnInterval) {
        spawnZombie();
        lastZombieSpawnRef.current = now;
      }

      if (now - lastSunSpawnRef.current > SUN_SPAWN_INTERVAL) {
        spawnSun();
        lastSunSpawnRef.current = now;
      }

      // 1. Update Suns
      setSuns(prev => {
        return prev
          .map(s => ({ ...s, y: Math.min(s.y + 1.5, 450) })) // Smoother sun fall
          .filter(s => now - s.createdAt < 12000);
      });

      // 2. Update Plants (Shooting)
      setPlants(prev => {
        const newProjectiles: Projectile[] = [];
        const updatedPlants = prev.map(p => {
          if (p.type === 'shooter' || p.type === 'ice-shooter') {
            // Only shoot if zombie is in row AND within the visible board area (with a small buffer)
            const hasZombieInRow = currentZombies.some(z => 
              z.row === p.row && 
              z.x > p.col * CELL_SIZE && 
              z.x < GRID_COLS * CELL_SIZE - 40
            );
            if (hasZombieInRow && (!p.lastShot || now - p.lastShot > (p.type === 'ice-shooter' ? 2500 : 2000))) {
              newProjectiles.push({
                id: Math.random().toString(36).substr(2, 9),
                type: p.type === 'ice-shooter' ? 'ice' : 'normal',
                row: p.row,
                x: p.col * CELL_SIZE + 40,
                damage: 20,
              });
              playShootSound();
              return { ...p, lastShot: now };
            }
          } else if (p.type === 'sunflower') {
            if (!p.lastShot || now - p.lastShot > 10000) {
              setSuns(s => [...s, {
                id: Math.random().toString(36).substr(2, 9),
                x: p.col * CELL_SIZE + 20,
                y: p.row * CELL_SIZE + 20,
                value: 25,
                createdAt: now,
              }]);
              return { ...p, lastShot: now };
            }
          }
          return p;
        });

        if (newProjectiles.length > 0) {
          setProjectiles(proj => [...proj, ...newProjectiles]);
        }
        return updatedPlants;
      });

      // 3. Update Zombies (Movement & Eating)
      setZombies(prev => {
        let gameOver = false;
        const updatedZombies = prev.map(z => {
          // Precise collision with plants
          const plantInFront = currentPlants.find(p => p.row === z.row && z.x < p.col * CELL_SIZE + 60 && z.x > p.col * CELL_SIZE - 20);
          
          if (plantInFront) {
            setPlants(pList => pList.map(p => {
              if (p.id === plantInFront.id) {
                const damagePerFrame = p.type === 'wall' ? 0.1 : 0.4;
                const newHealth = p.health - damagePerFrame;
                if (newHealth <= 0) {
                  playDeathSound();
                  triggerShake();
                }
                return { ...p, health: newHealth };
              }
              return p;
            }).filter(p => p.health > 0));
            return { ...z, isEating: true };
          } else {
            const isSlowed = z.isSlowed && now < z.isSlowed;
            const currentSpeed = isSlowed ? z.speed * 0.4 : z.speed;
            const newX = z.x - currentSpeed;
            if (newX < 80) gameOver = true;
            return { ...z, x: newX, isEating: false };
          }
        });

        if (gameOver) setGameState('gameover');
        return updatedZombies;
      });

      // 4. Update Projectiles & Collisions
      setProjectiles(prevProj => {
        const hitProjectiles = new Set<string>();
        const movedProjectiles = prevProj.map(p => ({ ...p, x: p.x + 6 }));
        
        setZombies(prevZom => {
          return prevZom.map(z => {
            const hitBy = movedProjectiles.find(p => 
              p.row === z.row && 
              z.x < GRID_COLS * CELL_SIZE - 10 &&
              p.x + 20 > z.x + 15 && 
              p.x < z.x + 65
            );
            
            if (hitBy && !hitProjectiles.has(hitBy.id)) {
              hitProjectiles.add(hitBy.id);
              playHitSound();
              addFloatingText(z.x + 20, z.row * CELL_SIZE, `-${hitBy.damage}`, 'text-rose-400 font-black scale-125');
              const newHealth = z.health - hitBy.damage;
              if (newHealth <= 0) {
                setScore(s => s + (z.type === 'tank' ? 500 : z.type === 'conehead' ? 250 : z.type === 'fast' ? 150 : 100));
                playDeathSound();
              }
              return { 
                ...z, 
                health: newHealth, 
                lastHit: now,
                isSlowed: hitBy.type === 'ice' ? now + 4000 : z.isSlowed 
              };
            }
            return z;
          }).filter(z => z.health > 0);
        });

        return movedProjectiles
          .filter(p => !hitProjectiles.has(p.id))
          .filter(p => p.x < GRID_COLS * CELL_SIZE + 100);
      });

      // Check for victory
      if (progress >= 100 && currentZombies.length === 0 && gameState === 'playing') {
        setGameState('victory');
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, spawnZombie, spawnSun, setGameState, setWaveProgress, setSuns, setPlants, setProjectiles, setZombies, setScore, triggerShake, addFloatingText]);

  return (
    <div className={cn(
      "w-full h-full bg-[#050505] flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden transition-transform relative",
      screenShake && "translate-x-1 translate-y-1"
    )}>
      {/* HUD */}
      <HUD />

      {/* Floating Texts */}
      <FloatingText />

      <div className="flex gap-8 items-center">
        {/* Seed Packets (Left Sidebar) */}
        <div className="flex flex-col gap-3 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border-2 border-white/5 shadow-2xl">
          {(Object.keys(PLANT_DATA) as PlantType[]).map(type => (
            <PlantCard
              key={type}
              type={type}
            />
          ))}
          
          <div className="h-[2px] bg-white/10 my-2 rounded-full" />

          {/* Shovel */}
          <button
            onClick={() => {
              setIsShovelSelected(!isShovelSelected);
              setSelectedPlant(null);
            }}
            className={cn(
              "w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-4",
              isShovelSelected 
                ? "border-rose-500 bg-rose-950/40 shadow-[0_0_30px_rgba(244,63,94,0.4)]" 
                : "border-white/10 bg-black/60"
            )}
          >
            <RefreshCw size={32} className={cn("transition-transform duration-500", isShovelSelected ? "rotate-180 text-rose-500" : "text-white/40")} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", isShovelSelected ? "text-rose-500" : "text-white/20")}>Shovel</span>
          </button>
        </div>

        {/* Game Board */}
        <div 
          className="relative bg-[#0a1a0a] border-[12px] border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]" 
          style={{ width: GRID_COLS * CELL_SIZE + 100, height: GRID_ROWS * CELL_SIZE }}
        >
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
          
          {/* House Area (Left Side) */}
          <div className="absolute left-0 top-0 bottom-0 w-[100px] bg-black/40 border-r-4 border-white/5 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="rotate-90 text-[10px] text-white/10 tracking-[1.5em] font-black uppercase pointer-events-none">
              SECURE_ZONE
            </div>
          </div>

          {/* The Lawn */}
          <div className="absolute left-[100px] right-0 top-0 bottom-0">
            {/* Grid Cells */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
              {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
                const row = Math.floor(i / GRID_COLS);
                const col = i % GRID_COLS;
                return (
                  <GridCell
                    key={i}
                    row={row}
                    col={col}
                    onClick={() => handleCellClick(row, col)}
                  />
                );
              })}
            </div>

            {/* Projectiles */}
            {projectiles.map(p => <ProjectileComponent key={p.id} projectile={p} />)}

            {/* Zombies */}
            {zombies.map(z => <ZombieComponent key={z.id} zombie={z} />)}

            {/* Suns */}
            {suns.map(s => (
              <SunComponent 
                key={s.id} 
                sun={s} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <Overlay />

      {/* Footer Info */}
      <div className="absolute bottom-8 flex items-center gap-12 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          SYSTEM_ONLINE
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full" />
          THREAT_DETECTED
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div>GARDEN_DEFENSE_V2.0</div>
      </div>
    </div>
  );
};

export default ZombiePlant;

