import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull, ArrowRight, ShieldAlert } from 'lucide-react';
import { audio } from './audio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const STREET_MIN_Y = 380;
const STREET_MAX_Y = 560;
const GRAVITY = 0.8;
const LEVEL_LENGTH = 5000;
const BOSS_X = 4500;

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  z: number;
  text: string;
  timer: number;
  color: string;
}

interface Entity {
  id: string;
  type: 'player' | 'enemy' | 'boss' | 'object';
  subType?: 'thug' | 'tank' | 'barrel';
  x: number;
  y: number; // Depth on the street
  z: number; // Height (jumping)
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  state: 'idle' | 'walk' | 'punch' | 'kick' | 'jump' | 'hit' | 'dead' | 'attack_prep';
  stateTimer: number;
  color: string;
  attackBox: { w: number, h: number, d: number } | null;
  combo?: number;
  lastHitTime?: number;
  flash?: number;
}

const createPlayer = (): Entity => ({
  id: 'player',
  type: 'player',
  x: 100,
  y: 450,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  width: 40,
  height: 80,
  hp: 100,
  maxHp: 100,
  facing: 1,
  state: 'idle',
  stateTimer: 0,
  color: '#3b82f6', // Blue
  attackBox: null,
});

const createEnemy = (x: number, y: number, subType: 'thug' | 'tank' = 'thug'): Entity => ({
  id: `enemy_${Math.random().toString(36).substr(2, 9)}`,
  type: 'enemy',
  subType,
  x,
  y,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  width: subType === 'tank' ? 60 : 40,
  height: subType === 'tank' ? 100 : 80,
  hp: subType === 'tank' ? 120 : 40,
  maxHp: subType === 'tank' ? 120 : 40,
  facing: -1,
  state: 'idle',
  stateTimer: 0,
  color: subType === 'tank' ? '#991b1b' : '#ef4444',
  attackBox: null,
});

const createBoss = (x: number, y: number): Entity => ({
  id: 'boss',
  type: 'boss',
  x,
  y,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  width: 80,
  height: 120,
  hp: 500,
  maxHp: 500,
  facing: -1,
  state: 'idle',
  stateTimer: 0,
  color: '#4c1d95', // Purple
  attackBox: null,
});

const createObject = (x: number, y: number, subType: 'barrel' = 'barrel'): Entity => ({
  id: `obj_${Math.random().toString(36).substr(2, 9)}`,
  type: 'object',
  subType,
  x,
  y,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  width: 40,
  height: 50,
  hp: 1,
  maxHp: 1,
  facing: 1,
  state: 'idle',
  stateTimer: 0,
  color: '#78350f', // Brown
  attackBox: null,
});

const CityBrawler = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('START');
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [progress, setProgress] = useState(0);
  const [combo, setCombo] = useState(0);

  const stateRef = useRef({
    player: createPlayer(),
    enemies: [] as Entity[],
    objects: [] as Entity[],
    cameraX: 0,
    keys: { left: false, right: false, up: false, down: false, z: false, x: false, space: false },
    score: 0,
    lastSpawnX: 0,
    hitEffects: [] as { x: number, y: number, z: number, timer: number, type: 'hit' | 'spark' | 'impact' }[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    hitStop: 0,
    shake: 0,
    combo: 0,
    comboTimer: 0,
    bossSpawned: false,
    goTimer: 0,
    frame: 0,
    screenFlash: 0,
  });

  const startGame = () => {
    audio.init();
    stateRef.current = {
      player: createPlayer(),
      enemies: [],
      objects: [
        createObject(800, 450),
        createObject(1500, 400),
        createObject(2200, 500),
        createObject(3000, 450),
      ],
      cameraX: 0,
      keys: { left: false, right: false, up: false, down: false, z: false, x: false, space: false },
      score: 0,
      lastSpawnX: 0,
      hitEffects: [],
      particles: [],
      floatingTexts: [],
      hitStop: 0,
      shake: 0,
      combo: 0,
      comboTimer: 0,
      bossSpawned: false,
      goTimer: 0,
      frame: 0,
      screenFlash: 0,
    };
    setScore(0);
    setPlayerHp(100);
    setProgress(0);
    setCombo(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      const keys = stateRef.current.keys;
      if (e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'ArrowRight') keys.right = true;
      if (e.key === 'ArrowUp') keys.up = true;
      if (e.key === 'ArrowDown') keys.down = true;
      if (e.key.toLowerCase() === 'z') keys.z = true;
      if (e.key.toLowerCase() === 'x') keys.x = true;
      if (e.key === ' ') keys.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'ArrowUp') keys.up = false;
      if (e.key === 'ArrowDown') keys.down = false;
      if (e.key.toLowerCase() === 'z') keys.z = false;
      if (e.key.toLowerCase() === 'x') keys.x = false;
      if (e.key === ' ') keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnParticles = (x: number, y: number, z: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x, y, z,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 4,
          vz: Math.random() * 10,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color,
          size: 2 + Math.random() * 4
        });
      }
    };

    const checkHit = (attacker: Entity, defender: Entity, damage: number, knockbackX: number, knockbackZ: number) => {
      if (defender.state === 'dead' || defender.state === 'hit') return false;
      
      // Check Z (height)
      if (Math.abs(attacker.z - defender.z) > 40) return false;
      
      // Check Y (depth)
      if (Math.abs(attacker.y - defender.y) > 25) return false;

      // Check X (horizontal)
      const attackRange = attacker.type === 'boss' ? 80 : 60;
      const dist = (defender.x - attacker.x) * attacker.facing;
      
      if (dist > 0 && dist < attackRange) {
        defender.hp -= damage;
        defender.state = 'hit';
        defender.stateTimer = defender.type === 'boss' ? 10 : 20;
        defender.vx = attacker.facing * knockbackX;
        defender.vz = knockbackZ;
        defender.flash = 5; // Flash white
        
        stateRef.current.hitStop = 6; // Slightly longer hitstop
        if (attacker.type === 'player') {
          stateRef.current.combo++;
          stateRef.current.comboTimer = 120;
          setCombo(stateRef.current.combo);
          stateRef.current.shake = 8;
          
          if (stateRef.current.combo % 5 === 0) {
            stateRef.current.floatingTexts.push({
              x: defender.x, y: defender.y, z: defender.z + 100,
              text: 'EXCELLENT!', color: '#fbbf24', timer: 40
            });
          }
        } else {
          stateRef.current.shake = 12;
        }

        stateRef.current.hitEffects.push({
          x: defender.x,
          y: defender.y,
          z: defender.z + 40,
          timer: 15,
          type: 'impact'
        });

        spawnParticles(defender.x, defender.y, defender.z + 40, attacker.type === 'player' ? '#fde047' : '#ef4444', 15);

        if (defender.type === 'enemy' || defender.type === 'boss') {
          audio.playHit();
          stateRef.current.score += 10 * (1 + Math.floor(stateRef.current.combo / 5));
          setScore(stateRef.current.score);
          
          stateRef.current.floatingTexts.push({
            x: defender.x, y: defender.y, z: defender.z + 60,
            text: `-${damage}`, color: '#fff', timer: 30
          });

          if (defender.hp <= 0) {
            defender.state = 'dead';
            defender.stateTimer = 90;
            audio.playEnemyDie();
            stateRef.current.score += defender.type === 'boss' ? 5000 : 100;
            setScore(stateRef.current.score);
            stateRef.current.shake = 20;
            stateRef.current.hitStop = 15;
            stateRef.current.screenFlash = 10;
            spawnParticles(defender.x, defender.y, defender.z + 40, '#ef4444', 30);
          }
        } else if (defender.type === 'object') {
          defender.hp = 0;
          defender.state = 'dead';
          defender.stateTimer = 1;
          audio.playHit();
          spawnParticles(defender.x, defender.y, defender.z + 20, '#78350f', 20);
          // Drop health
          if (Math.random() < 0.5) {
            setPlayerHp(prev => Math.min(100, prev + 20));
            stateRef.current.player.hp = Math.min(100, stateRef.current.player.hp + 20);
            stateRef.current.floatingTexts.push({
              x: defender.x, y: defender.y, z: defender.z + 40,
              text: 'HEALTH UP!', color: '#22c55e', timer: 50
            });
          }
        } else {
          audio.playPlayerHit();
          setPlayerHp(Math.max(0, defender.hp));
          if (defender.hp <= 0) {
            defender.state = 'dead';
            setGameState('GAME_OVER');
            audio.playGameOver();
          }
        }
        return true;
      }
      return false;
    };

    const update = () => {
      const state = stateRef.current;
      const { player, enemies, objects, keys, particles, floatingTexts, hitEffects } = state;

      if (state.hitStop > 0) {
        state.hitStop--;
        return;
      }

      state.frame++;
      if (state.shake > 0) state.shake--;
      if (state.screenFlash > 0) state.screenFlash--;
      if (state.comboTimer > 0) {
        state.comboTimer--;
        if (state.comboTimer <= 0) {
          state.combo = 0;
          setCombo(0);
        }
      }

      // --- Player Logic ---
      if (player.state !== 'dead') {
        if (player.flash && player.flash > 0) player.flash--;
        // State transitions
        if (player.stateTimer > 0) {
          player.stateTimer--;
          if (player.stateTimer <= 0) {
            if (player.state === 'punch' || player.state === 'kick' || player.state === 'hit') {
              player.state = 'idle';
            }
          }
        }

        // Controls (only if idle or walking or jumping)
        if (player.state === 'idle' || player.state === 'walk' || player.state === 'jump') {
          // Movement
          player.vx = 0;
          player.vy = 0;
          
          if (keys.left) { player.vx = -4; player.facing = -1; }
          if (keys.right) { player.vx = 4; player.facing = 1; }
          if (keys.up) player.vy = -3;
          if (keys.down) player.vy = 3;

          if (player.z === 0) {
            if (player.vx !== 0 || player.vy !== 0) player.state = 'walk';
            else player.state = 'idle';

            // Jump
            if (keys.space) {
              player.vz = 12;
              player.state = 'jump';
              keys.space = false; // Prevent holding
            }

            // Attack
            if (keys.z && player.stateTimer <= 0) {
              player.state = 'punch';
              player.stateTimer = 12;
              player.vx = 0;
              player.vy = 0;
              audio.playPunchSwing();
              keys.z = false;
              
              // Check hits
              enemies.forEach(e => checkHit(player, e, 10, 2, 0));
              objects.forEach(o => checkHit(player, o, 1, 0, 0));
              if (state.bossSpawned && state.enemies.find(e => e.type === 'boss')) {
                checkHit(player, state.enemies.find(e => e.type === 'boss')!, 10, 1, 0);
              }
            } else if (keys.x && player.stateTimer <= 0) {
              player.state = 'kick';
              player.stateTimer = 18;
              player.vx = 0;
              player.vy = 0;
              audio.playKickSwing();
              keys.x = false;

              // Check hits
              enemies.forEach(e => checkHit(player, e, 15, 5, 5));
              objects.forEach(o => checkHit(player, o, 1, 0, 0));
              if (state.bossSpawned && state.enemies.find(e => e.type === 'boss')) {
                checkHit(player, state.enemies.find(e => e.type === 'boss')!, 15, 3, 2);
              }
            }
          } else {
            // Jump kick
            if (keys.x && player.stateTimer <= 0) {
               player.state = 'kick';
               player.stateTimer = 20;
               audio.playKickSwing();
               keys.x = false;
               enemies.forEach(e => checkHit(player, e, 20, 8, 0));
               objects.forEach(o => checkHit(player, o, 1, 0, 0));
               if (state.bossSpawned && state.enemies.find(e => e.type === 'boss')) {
                 checkHit(player, state.enemies.find(e => e.type === 'boss')!, 20, 5, 0);
               }
            }
          }
        }

        // Apply physics
        player.x += player.vx;
        player.y += player.vy;
        
        // Z physics
        player.z += player.vz;
        if (player.z > 0) {
          player.vz -= GRAVITY;
        } else {
          player.z = 0;
          player.vz = 0;
          if (player.state === 'jump') player.state = 'idle';
        }

        // Bounds
        if (player.y < STREET_MIN_Y) player.y = STREET_MIN_Y;
        if (player.y > STREET_MAX_Y) player.y = STREET_MAX_Y;
        if (player.x < state.cameraX + 20) player.x = state.cameraX + 20;
        
        // Camera follow
        if (player.x > state.cameraX + CANVAS_WIDTH / 2 && player.x < LEVEL_LENGTH - CANVAS_WIDTH / 2) {
          // Only scroll if all enemies on screen are dead
          const activeEnemies = enemies.filter(e => e.x < state.cameraX + CANVAS_WIDTH && e.state !== 'dead');
          if (activeEnemies.length === 0) {
            state.cameraX = player.x - CANVAS_WIDTH / 2;
            state.goTimer = (state.goTimer + 1) % 60;
          } else {
            state.goTimer = 0;
          }
        }

        // Win condition
        setProgress(Math.min(100, Math.floor((player.x / LEVEL_LENGTH) * 100)));
        if (player.x >= LEVEL_LENGTH - 100 && enemies.length === 0) {
          setGameState('WIN');
          audio.playWin();
        }
      }

      // --- Spawner Logic ---
      if (state.cameraX > state.lastSpawnX + 600 && player.x < BOSS_X - 500) {
        state.lastSpawnX = state.cameraX;
        // Spawn 2-4 enemies
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
          const type = Math.random() < 0.2 ? 'tank' : 'thug';
          enemies.push(createEnemy(
            state.cameraX + CANVAS_WIDTH + Math.random() * 100,
            STREET_MIN_Y + Math.random() * (STREET_MAX_Y - STREET_MIN_Y),
            type
          ));
        }
      }

      // Boss Spawn
      if (player.x > BOSS_X && !state.bossSpawned) {
        state.bossSpawned = true;
        enemies.push(createBoss(player.x + 400, (STREET_MIN_Y + STREET_MAX_Y) / 2));
      }

      // --- Enemy Logic ---
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.flash && enemy.flash > 0) enemy.flash--;
        
        if (enemy.stateTimer > 0) {
          enemy.stateTimer--;
          if (enemy.stateTimer <= 0) {
            if (enemy.state === 'dead') {
              enemies.splice(i, 1);
              continue;
            }
            if (enemy.state === 'hit' || enemy.state === 'punch' || enemy.state === 'attack_prep') {
              enemy.state = 'idle';
            }
          }
        }

        if (enemy.state !== 'dead' && enemy.state !== 'hit') {
          // Simple AI
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (enemy.state === 'idle' || enemy.state === 'walk') {
            const attackDist = enemy.type === 'boss' ? 100 : 70;
            if (dist < attackDist && Math.abs(dy) < 30) {
              // Attack
              const attackChance = enemy.type === 'boss' ? 0.08 : (enemy.subType === 'tank' ? 0.02 : 0.05);
              if (Math.random() < attackChance && player.state !== 'dead') {
                enemy.state = enemy.type === 'boss' ? 'attack_prep' : 'punch';
                enemy.stateTimer = enemy.type === 'boss' ? 40 : 25;
                enemy.vx = 0;
                enemy.vy = 0;
                
                // Hit check
                const hitFrame = enemy.type === 'boss' ? 30 : 15;
                setTimeout(() => {
                  if ((enemy.state === 'punch' || enemy.state === 'attack_prep') && player.state !== 'dead') {
                    const damage = enemy.type === 'boss' ? 30 : (enemy.subType === 'tank' ? 20 : 10);
                    checkHit(enemy, player, damage, 5, 0);
                  }
                }, hitFrame * 16);
              } else {
                enemy.state = 'idle';
                enemy.vx = 0;
                enemy.vy = 0;
              }
            } else {
              // Move towards player
              enemy.state = 'walk';
              const speed = enemy.type === 'boss' ? 2.5 : (enemy.subType === 'tank' ? 1.5 : 2.2);
              enemy.vx = dx > 0 ? speed : -speed;
              enemy.vy = dy > 0 ? speed * 0.5 : -speed * 0.5;
              enemy.facing = dx > 0 ? 1 : -1;
              
              // Don't overlap too much with other enemies
              enemies.forEach(other => {
                if (other !== enemy && other.state !== 'dead') {
                  const odx = enemy.x - other.x;
                  const ody = enemy.y - other.y;
                  if (Math.abs(odx) < 40 && Math.abs(ody) < 25) {
                    enemy.vy += ody > 0 ? 1 : -1;
                  }
                }
              });
            }
          }
        }

        // Apply physics
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.z += enemy.vz;
        if (enemy.z > 0) {
          enemy.vz -= GRAVITY;
        } else {
          enemy.z = 0;
          enemy.vz = 0;
        }

        // Bounds
        if (enemy.y < STREET_MIN_Y) enemy.y = STREET_MIN_Y;
        if (enemy.y > STREET_MAX_Y) enemy.y = STREET_MAX_Y;
      }

      // --- Hit Effects ---
      for (let i = hitEffects.length - 1; i >= 0; i--) {
        hitEffects[i].timer--;
        if (hitEffects[i].timer <= 0) {
          hitEffects.splice(i, 1);
        }
      }

      // --- Particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vz -= 0.5; // Particle gravity
        if (p.z < 0) {
          p.z = 0;
          p.vx *= 0.5;
          p.vy *= 0.5;
        }
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // --- Floating Texts ---
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.z += 1;
        ft.timer--;
        if (ft.timer <= 0) floatingTexts.splice(i, 1);
      }
    };

    const draw = () => {
      const state = stateRef.current;
      const { player, enemies, objects, cameraX, hitEffects, particles, floatingTexts, shake } = state;

      // Clear
      ctx.fillStyle = '#0f172a'; // Darker sky
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background elements (parallax)
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 15; i++) {
        const bx = ((i * 150) - (cameraX * 0.3)) % (CANVAS_WIDTH + 200);
        ctx.fillRect(bx - 100, 50, 60, 300);
        // Windows
        ctx.fillStyle = '#334155';
        for (let j = 0; j < 5; j++) {
           ctx.fillRect(bx - 80, 80 + j * 40, 20, 20);
        }
        ctx.fillStyle = '#1e293b';
      }

      // Draw Street with gradient
      const streetGrad = ctx.createLinearGradient(0, STREET_MIN_Y, 0, CANVAS_HEIGHT);
      streetGrad.addColorStop(0, '#1e293b');
      streetGrad.addColorStop(0.1, '#334155');
      streetGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = streetGrad;
      ctx.fillRect(0, STREET_MIN_Y - 20, CANVAS_WIDTH, CANVAS_HEIGHT - STREET_MIN_Y + 20);
      
      // Sidewalk
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, STREET_MIN_Y - 40, CANVAS_WIDTH, 20);

      // Street lines
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 30]);
      ctx.beginPath();
      ctx.moveTo(0, (STREET_MIN_Y + STREET_MAX_Y) / 2);
      ctx.lineTo(CANVAS_WIDTH, (STREET_MIN_Y + STREET_MAX_Y) / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      // Apply Screen Shake
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }
      ctx.translate(-cameraX, 0);

      // Sort entities by Y depth for proper rendering order
      const entities = [player, ...enemies, ...objects].sort((a, b) => a.y - b.y);

      for (const ent of entities) {
        const drawX = ent.x;
        const drawY = ent.y - ent.z;

        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(ent.x, ent.y, ent.width / 2 + 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Entity
        if (ent.state === 'dead') {
          if (ent.type === 'object') continue;
          ctx.fillStyle = ent.color;
          ctx.globalAlpha = ent.stateTimer / 90;
          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(Math.PI / 2 * ent.facing);
          ctx.fillRect(-ent.height/2, -ent.width/2, ent.height, ent.width);
          ctx.restore();
          ctx.globalAlpha = 1.0;
        } else {
          // Body
          ctx.fillStyle = (ent.flash && ent.flash > 0) || ent.state === 'hit' ? '#ffffff' : ent.color;
          
          // Character rendering
          if (ent.type === 'player' || ent.type === 'enemy' || ent.type === 'boss') {
            // Legs
            ctx.fillRect(drawX - ent.width/2 + 5, drawY - 30, 10, 30);
            ctx.fillRect(drawX + ent.width/2 - 15, drawY - 30, 10, 30);
            
            // Torso
            ctx.fillRect(drawX - ent.width/2, drawY - ent.height + 20, ent.width, ent.height - 40);
            
            // Head
            ctx.fillRect(drawX - 15, drawY - ent.height, 30, 30);
            
            // Face direction indicator
            ctx.fillStyle = '#000';
            ctx.fillRect(drawX + (ent.facing * 10) - 5, drawY - ent.height + 5, 12, 6);

            // Attack visuals
            if (ent.state === 'punch' || ent.state === 'attack_prep') {
              ctx.fillStyle = ent.state === 'attack_prep' ? '#ef4444' : '#fde047';
              ctx.fillRect(drawX + (ent.facing * 15), drawY - ent.height + 30, (ent.state === 'attack_prep' ? 20 : 40) * ent.facing, 12);
              
              // Motion trail
              if (ent.type === 'player') {
                ctx.globalAlpha = 0.3;
                ctx.fillRect(drawX + (ent.facing * 10), drawY - ent.height + 25, 60 * ent.facing, 20);
                ctx.globalAlpha = 1.0;
              }
            } else if (ent.state === 'kick') {
              ctx.fillStyle = '#fde047';
              ctx.fillRect(drawX + (ent.facing * 15), drawY - 35, 50 * ent.facing, 15);
              
              // Motion trail
              if (ent.type === 'player') {
                ctx.globalAlpha = 0.3;
                ctx.fillRect(drawX + (ent.facing * 10), drawY - 45, 70 * ent.facing, 30);
                ctx.globalAlpha = 1.0;
              }
            }
          } else if (ent.subType === 'barrel') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(drawX - 20, drawY - 50, 40, 50);
            ctx.fillStyle = '#451a03';
            ctx.fillRect(drawX - 20, drawY - 40, 40, 5);
            ctx.fillRect(drawX - 20, drawY - 15, 40, 5);
          }

          // Health bar for enemies and boss
          if ((ent.type === 'enemy' || ent.type === 'boss') && ent.hp < ent.maxHp) {
            const barWidth = ent.type === 'boss' ? 100 : 40;
            ctx.fillStyle = '#450a0a';
            ctx.fillRect(drawX - barWidth/2, drawY - ent.height - 20, barWidth, 6);
            ctx.fillStyle = ent.type === 'boss' ? '#a855f7' : '#ef4444';
            ctx.fillRect(drawX - barWidth/2, drawY - ent.height - 20, barWidth * (ent.hp / ent.maxHp), 6);
          }
        }
      }

      // Draw Hit Effects
      for (const fx of hitEffects) {
        if (fx.type === 'impact') {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const r1 = 10;
            const r2 = 30 + (15 - fx.timer) * 2;
            ctx.moveTo(fx.x + Math.cos(angle) * r1, fx.y - fx.z + Math.sin(angle) * r1);
            ctx.lineTo(fx.x + Math.cos(angle) * r2, fx.y - fx.z + Math.sin(angle) * r2);
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = fx.type === 'spark' ? '#fef08a' : '#ffffff';
          const size = fx.type === 'spark' ? 25 : 15;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const r = i % 2 === 0 ? size : size / 2;
            ctx.lineTo(fx.x + Math.cos(angle) * r, fx.y - fx.z + Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x - p.size/2, p.y - p.z - p.size/2, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }

      // Draw Floating Texts
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px Arial';
      for (const ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.timer / 40;
        ctx.fillText(ft.text, ft.x, ft.y - ft.z);
        ctx.globalAlpha = 1.0;
      }

      // Screen Flash
      if (state.screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.screenFlash / 10})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Draw Level End Line
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(LEVEL_LENGTH, STREET_MIN_Y);
      ctx.lineTo(LEVEL_LENGTH, STREET_MAX_Y);
      ctx.stroke();

      ctx.restore();

      // GO! Indicator
      if (state.goTimer > 0 && state.goTimer < 30) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GO!', CANVAS_WIDTH - 100, CANVAS_HEIGHT / 2);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH - 50, CANVAS_HEIGHT / 2);
        ctx.lineTo(CANVAS_WIDTH - 80, CANVAS_HEIGHT / 2 - 20);
        ctx.lineTo(CANVAS_WIDTH - 80, CANVAS_HEIGHT / 2 + 20);
        ctx.fill();
      }

      // Boss Health Bar (HUD style)
      const boss = enemies.find(e => e.type === 'boss');
      if (boss) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(CANVAS_WIDTH / 2 - 200, CANVAS_HEIGHT - 60, 400, 30);
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(CANVAS_WIDTH / 2 - 195, CANVAS_HEIGHT - 55, 390 * (boss.hp / boss.maxHp), 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STREET KING', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
      }
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center font-pixel text-white select-none">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 px-8">
        <div className="flex flex-col gap-2 w-1/3">
          <div className="flex items-center gap-2 text-xl text-blue-400 font-bold">
            PLAYER 1
          </div>
          <div className="h-6 w-full bg-gray-800 border-2 border-gray-600 rounded overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-yellow-400 transition-all duration-200"
              style={{ width: `${playerHp}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white drop-shadow-md">
              {playerHp} / 100
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl text-yellow-400 font-bold drop-shadow-[2px_2px_0_#000]">
            SCORE: {score.toString().padStart(6, '0')}
          </div>
          {combo > 1 && (
            <motion.div 
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black text-white italic drop-shadow-[2px_2px_0_#ef4444]"
            >
              {combo} HIT COMBO!
            </motion.div>
          )}
          <div className="text-sm text-gray-400">
            PROGRESS: {progress}%
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 flex gap-4">
        <span>ARROWS: Move</span>
        <span>Z: Punch</span>
        <span>X: Kick</span>
        <span>SPACE: Jump</span>
      </div>

      <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-gray-800 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-black"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Overlays */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <h1 className="text-6xl font-bold text-blue-500 mb-2 drop-shadow-[4px_4px_0_#000] italic">CITY BRAWLER</h1>
            <p className="text-red-500 mb-8 text-xl font-bold tracking-widest">TAKE BACK THE STREETS</p>
            
            <div className="flex gap-8 mb-8 text-gray-300 text-sm bg-gray-900/80 p-6 border-2 border-gray-700 rounded">
              <div className="flex flex-col gap-2">
                <span className="text-yellow-400">MOVEMENT</span>
                <span>↑ ↓ ← →</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-yellow-400">ATTACKS</span>
                <span>Z - PUNCH (Fast)</span>
                <span>X - KICK (Strong)</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-yellow-400">ACTION</span>
                <span>SPACE - JUMP</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-4 bg-blue-600 text-white font-bold text-2xl hover:bg-blue-500 hover:scale-105 transition-all border-4 border-blue-800 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            >
              INSERT COIN
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center">
            <Skull size={64} className="text-black mb-4 animate-pulse" />
            <h2 className="text-6xl font-bold text-black mb-4 drop-shadow-[2px_2px_0_#ef4444]">GAME OVER</h2>
            <p className="text-white mb-8 text-2xl">FINAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-black text-red-500 font-bold text-2xl hover:bg-gray-900 hover:scale-105 transition-all border-2 border-red-500"
            >
              CONTINUE?
            </button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-blue-900/90 flex flex-col items-center justify-center">
            <ShieldAlert size={64} className="text-yellow-400 mb-4" />
            <h2 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-[2px_2px_0_#000]">STREETS CLEARED!</h2>
            <p className="text-white mb-2 text-2xl">FINAL SCORE: {score}</p>
            <p className="text-blue-300 mb-8 text-xl">THE CITY IS SAFE ONCE AGAIN.</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-yellow-500 text-black font-bold text-2xl hover:bg-yellow-400 hover:scale-105 transition-all border-4 border-yellow-700"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityBrawler;
