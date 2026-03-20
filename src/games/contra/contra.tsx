import React, { useEffect, useRef, useState } from 'react';
import { Heart, Skull, Target } from 'lucide-react';
import { audio } from './audio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const SPEED = 4;
const BULLET_SPEED = 10;
const LEVEL_LENGTH = 4000;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'duck' | 'dead';
  facing: 1 | -1; // 1 right, -1 left
  aimAngle: number; // degrees
  shootCooldown: number;
  invincible: number;
  hp: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
  active: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  state: 'run' | 'dead';
  facing: 1 | -1;
  shootCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const PLATFORMS: Rect[] = [
  { x: 0, y: 500, w: 1000, h: 100 },
  { x: 1200, y: 500, w: 800, h: 100 },
  { x: 2200, y: 500, w: 2000, h: 100 },
  // Floating platforms
  { x: 400, y: 350, w: 200, h: 20 },
  { x: 700, y: 250, w: 200, h: 20 },
  { x: 1000, y: 350, w: 200, h: 20 },
  { x: 1500, y: 350, w: 200, h: 20 },
  { x: 1800, y: 250, w: 300, h: 20 },
  { x: 2400, y: 350, w: 200, h: 20 },
  { x: 2800, y: 250, w: 200, h: 20 },
  { x: 3200, y: 350, w: 400, h: 20 },
];

const checkCollision = (r1: Rect, r2: Rect) => {
  return r1.x < r2.x + r2.w &&
         r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h &&
         r1.y + r1.h > r2.y;
};

const Contra = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const stateRef = useRef({
    player: {
      x: 100, y: 400, vx: 0, vy: 0, w: 30, h: 60,
      state: 'idle', facing: 1, aimAngle: 0, shootCooldown: 0, invincible: 0, hp: 1
    } as Player,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    cameraX: 0,
    keys: { left: false, right: false, up: false, down: false, z: false, x: false },
    score: 0,
    lives: 3,
    gameState: 'START' as any,
    bulletIdCounter: 0,
    enemyIdCounter: 0,
    lastSpawnX: 0,
  });

  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    stateRef.current.lives = lives;
  }, [lives]);

  const startGame = () => {
    audio.init();
    stateRef.current = {
      player: {
        x: 100, y: 400, vx: 0, vy: 0, w: 30, h: 60,
        state: 'idle', facing: 1, aimAngle: 0, shootCooldown: 0, invincible: 60, hp: 1
      },
      bullets: [],
      enemies: [],
      particles: [],
      cameraX: 0,
      keys: { left: false, right: false, up: false, down: false, z: false, x: false },
      score: 0,
      lives: 3,
      gameState: 'PLAYING',
      bulletIdCounter: 0,
      enemyIdCounter: 0,
      lastSpawnX: 0,
    };
    setScore(0);
    setLives(3);
    stateRef.current.lives = 3;
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
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'ArrowUp') keys.up = false;
      if (e.key === 'ArrowDown') keys.down = false;
      if (e.key.toLowerCase() === 'z') keys.z = false;
      if (e.key.toLowerCase() === 'x') keys.x = false;
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

    const spawnExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 10; i++) {
        stateRef.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 20 + Math.random() * 10,
          maxLife: 30,
          color
        });
      }
      audio.playExplosion();
    };

    const update = () => {
      const state = stateRef.current;
      const { player, bullets, enemies, particles, keys } = state;

      // --- Player Logic ---
      if (player.state !== 'dead') {
        if (player.invincible > 0) player.invincible--;
        if (player.shootCooldown > 0) player.shootCooldown--;

        // Horizontal movement
        player.vx = 0;
        if (keys.left && !keys.down) { player.vx = -SPEED; player.facing = -1; }
        if (keys.right && !keys.down) { player.vx = SPEED; player.facing = 1; }

        // Aiming
        if (keys.up) {
          if (keys.left) player.aimAngle = -135;
          else if (keys.right) player.aimAngle = -45;
          else player.aimAngle = -90;
        } else if (keys.down) {
          if (player.state === 'jump' || player.state === 'fall') {
            if (keys.left) player.aimAngle = 135;
            else if (keys.right) player.aimAngle = 45;
            else player.aimAngle = 90;
          } else {
            player.aimAngle = player.facing === 1 ? 0 : 180; // Ducking, aim forward
          }
        } else {
          player.aimAngle = player.facing === 1 ? 0 : 180;
        }

        // State machine
        if (player.vy === 0) {
          if (keys.down) {
            player.state = 'duck';
            player.h = 30;
            player.y += 30; // Adjust position when ducking
          } else {
            player.h = 60;
            if (player.vx !== 0) player.state = 'run';
            else player.state = 'idle';
          }

          // Jump
          if (keys.z && player.state !== 'duck') {
            player.vy = JUMP_FORCE;
            player.state = 'jump';
            audio.playJump();
            keys.z = false; // Prevent holding
          }
        } else {
          player.h = 40; // Curling up when jumping
          if (player.vy > 0) player.state = 'fall';
          else player.state = 'jump';
        }

        // Shooting
        if (keys.x && player.shootCooldown <= 0) {
          const rad = (player.aimAngle * Math.PI) / 180;
          let bx = player.x + player.w / 2;
          let by = player.y + (player.state === 'duck' ? 15 : 20);
          
          bullets.push({
            id: state.bulletIdCounter++,
            x: bx, y: by,
            vx: Math.cos(rad) * BULLET_SPEED,
            vy: Math.sin(rad) * BULLET_SPEED,
            isEnemy: false,
            active: true
          });
          player.shootCooldown = 8;
          audio.playShoot();
        }

        // Apply physics
        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;

        // Platform collision
        let onGround = false;
        for (const plat of PLATFORMS) {
          // Only collide if falling and previously above the platform
          if (player.vy > 0 && player.y - player.vy + player.h <= plat.y) {
            if (player.x + player.w > plat.x && player.x < plat.x + plat.w) {
              // If pressing down, drop through thin platforms
              if (keys.down && keys.z && plat.h <= 20) {
                // Drop through
              } else {
                player.y = plat.y - player.h;
                player.vy = 0;
                onGround = true;
              }
            }
          }
        }

        // Fall off bottom
        if (player.y > CANVAS_HEIGHT + 100) {
          player.hp = 0;
        }

        // Bounds
        if (player.x < state.cameraX) player.x = state.cameraX;

        // Camera follow
        if (player.x > state.cameraX + CANVAS_WIDTH / 2) {
          state.cameraX = player.x - CANVAS_WIDTH / 2;
        }

        // Check death
        if (player.hp <= 0) {
          player.state = 'dead';
          spawnExplosion(player.x + player.w/2, player.y + player.h/2, '#3b82f6');
          audio.playPlayerHit();
          
          setTimeout(() => {
            const state = stateRef.current;
            if (state.lives > 1) {
              setLives(l => l - 1);
              state.lives -= 1;
              // Respawn
              state.player = {
                x: state.cameraX + 100, y: 100, vx: 0, vy: 0, w: 30, h: 60,
                state: 'fall', facing: 1, aimAngle: 0, shootCooldown: 0, invincible: 120, hp: 1
              };
            } else {
              setGameState('GAME_OVER');
              audio.playGameOver();
            }
          }, 1000);
        }

        // Win condition
        if (player.x >= LEVEL_LENGTH) {
          setGameState('WIN');
          audio.playWin();
        }
      }

      // --- Spawner ---
      if (state.cameraX > state.lastSpawnX + 400 && player.x < LEVEL_LENGTH - 400) {
        state.lastSpawnX = state.cameraX;
        if (Math.random() > 0.3) {
          enemies.push({
            id: state.enemyIdCounter++,
            x: state.cameraX + CANVAS_WIDTH + 50,
            y: 100,
            vx: -2, vy: 0, w: 30, h: 60, hp: 1, state: 'run', facing: -1, shootCooldown: 60
          });
        }
      }

      // --- Enemies ---
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.state === 'dead') continue;

        enemy.vy += GRAVITY;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Platform collision
        for (const plat of PLATFORMS) {
          if (enemy.vy > 0 && enemy.y - enemy.vy + enemy.h <= plat.y) {
            if (enemy.x + enemy.w > plat.x && enemy.x < plat.x + plat.w) {
              enemy.y = plat.y - enemy.h;
              enemy.vy = 0;
            }
          }
        }

        // AI
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0 && Math.abs(enemy.x - player.x) < 600 && player.state !== 'dead') {
          // Shoot at player
          const dx = (player.x + player.w/2) - (enemy.x + enemy.w/2);
          const dy = (player.y + player.h/2) - (enemy.y + enemy.h/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          bullets.push({
            id: state.bulletIdCounter++,
            x: enemy.x + enemy.w/2, y: enemy.y + 20,
            vx: (dx / dist) * (BULLET_SPEED * 0.5),
            vy: (dy / dist) * (BULLET_SPEED * 0.5),
            isEnemy: true,
            active: true
          });
          enemy.shootCooldown = 120 + Math.random() * 60;
          audio.playEnemyShoot();
        }

        // Despawn
        if (enemy.y > CANVAS_HEIGHT + 100 || enemy.x < state.cameraX - 200) {
          enemies.splice(i, 1);
        }
      }

      // --- Bullets ---
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b.active) {
          bullets.splice(i, 1);
          continue;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Bounds
        if (b.x < state.cameraX || b.x > state.cameraX + CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
          b.active = false;
          continue;
        }

        // Collision
        if (b.isEnemy) {
          if (player.state !== 'dead' && player.invincible <= 0) {
            if (checkCollision({x: b.x-4, y: b.y-4, w: 8, h: 8}, player)) {
              player.hp -= 1;
              b.active = false;
            }
          }
        } else {
          for (const enemy of enemies) {
            if (enemy.state !== 'dead') {
              if (checkCollision({x: b.x-4, y: b.y-4, w: 8, h: 8}, enemy)) {
                enemy.hp -= 1;
                b.active = false;
                if (enemy.hp <= 0) {
                  enemy.state = 'dead';
                  spawnExplosion(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#ef4444');
                  state.score += 100;
                  setScore(state.score);
                }
              }
            }
          }
        }
      }

      // Cleanup dead enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].state === 'dead') enemies.splice(i, 1);
      }

      // Player body collision with enemies
      if (player.state !== 'dead' && player.invincible <= 0) {
        for (const enemy of enemies) {
          if (checkCollision(player, enemy)) {
            player.hp -= 1;
          }
        }
      }

      // --- Particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }
    };

    const draw = () => {
      const state = stateRef.current;
      const { player, bullets, enemies, particles, cameraX } = state;

      // Clear
      ctx.fillStyle = '#0f172a'; // Dark sky
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw Background Parallax
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 20; i++) {
        const bx = ((i * 300) - (cameraX * 0.3)) % (LEVEL_LENGTH + 1000);
        ctx.beginPath();
        ctx.moveTo(bx, CANVAS_HEIGHT);
        ctx.lineTo(bx + 150, CANVAS_HEIGHT - 300);
        ctx.lineTo(bx + 300, CANVAS_HEIGHT);
        ctx.fill();
      }

      // Draw Platforms
      ctx.fillStyle = '#166534'; // Jungle green
      for (const plat of PLATFORMS) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Grass top
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(plat.x, plat.y, plat.w, 8);
        ctx.fillStyle = '#166534';
      }

      // Draw Enemies
      for (const enemy of enemies) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + (enemy.facing === 1 ? 20 : 5), enemy.y + 10, 5, 5);
      }

      // Draw Player
      if (player.state !== 'dead') {
        if (player.invincible <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
          ctx.fillStyle = '#3b82f6'; // Blue pants/shirt
          
          // Adjust drawing Y if ducking to keep bottom aligned
          const drawY = player.state === 'duck' ? player.y : player.y;
          
          if (player.state === 'jump' || player.state === 'fall') {
            // Spinning ball
            ctx.beginPath();
            ctx.arc(player.x + player.w/2, player.y + player.h/2, player.w/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444'; // Red bandana flash
            ctx.fillRect(player.x + 5, player.y + 15, 20, 10);
          } else {
            ctx.fillRect(player.x, drawY, player.w, player.h);
            // Bandana
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(player.x - 2, drawY + 5, player.w + 4, 8);
            
            // Gun
            ctx.fillStyle = '#94a3b8';
            ctx.save();
            ctx.translate(player.x + player.w/2, drawY + 20);
            ctx.rotate((player.aimAngle * Math.PI) / 180);
            ctx.fillRect(0, -4, 25, 8);
            ctx.restore();
          }
        }
      }

      // Draw Bullets
      for (const b of bullets) {
        ctx.fillStyle = b.isEnemy ? '#ef4444' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // End Goal
      ctx.fillStyle = '#eab308';
      ctx.fillRect(LEVEL_LENGTH, 0, 50, CANVAS_HEIGHT);

      ctx.restore();
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xl text-blue-400 font-bold">
            1P
          </div>
          <div className="flex gap-2">
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <Heart key={i} size={20} className="text-red-500 fill-red-500" />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-2xl text-yellow-400 font-bold drop-shadow-[2px_2px_0_#000]">
            SCORE: {score.toString().padStart(6, '0')}
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 flex gap-4">
        <span>ARROWS: Move/Aim</span>
        <span>Z: Jump</span>
        <span>X: Shoot</span>
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
            <h1 className="text-6xl font-bold text-red-600 mb-2 drop-shadow-[4px_4px_0_#000] tracking-widest">COMMANDO</h1>
            <h2 className="text-4xl font-bold text-blue-500 mb-8 drop-shadow-[2px_2px_0_#000]">STRIKE</h2>
            
            <div className="flex gap-8 mb-8 text-gray-300 text-sm bg-gray-900/80 p-6 border-2 border-gray-700 rounded">
              <div className="flex flex-col gap-2">
                <span className="text-yellow-400">MOVEMENT</span>
                <span>← → : RUN</span>
                <span>↓ : DUCK</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-yellow-400">ACTION</span>
                <span>Z : JUMP</span>
                <span>X : SHOOT</span>
                <span>ARROWS + X : AIM</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-4 bg-red-600 text-white font-bold text-2xl hover:bg-red-500 hover:scale-105 transition-all border-4 border-red-800 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
            >
              START MISSION
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center">
            <Skull size={64} className="text-black mb-4 animate-pulse" />
            <h2 className="text-6xl font-bold text-black mb-4 drop-shadow-[2px_2px_0_#ef4444]">MISSION FAILED</h2>
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
            <Target size={64} className="text-yellow-400 mb-4" />
            <h2 className="text-6xl font-bold text-yellow-400 mb-4 drop-shadow-[2px_2px_0_#000]">MISSION ACCOMPLISHED</h2>
            <p className="text-white mb-2 text-2xl">FINAL SCORE: {score}</p>
            <p className="text-blue-300 mb-8 text-xl">THE ALIEN BASE IS DESTROYED.</p>
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

export default Contra;
