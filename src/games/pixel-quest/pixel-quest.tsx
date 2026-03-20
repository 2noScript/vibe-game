import React, { useRef, useEffect, useState } from 'react';
import { useStore } from './store';
import { GameStatus } from './types';
import { audio } from './audio';

// --- Constants ---
const TILE_SIZE = 32;
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const SPEED = 5;

// --- Level Data ---
const LEVEL_1 = [
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
  "......C.............",
  "....###.............",
  "...........C........",
  ".P.......###........",
  "###.................",
  "......###......C....",
  ".............###....",
  "....C...............",
  "..###.........E.....",
  "####################",
];

const LEVEL_2 = [
  "....................",
  "....................",
  "....................",
  ".........C..........",
  ".......###..........",
  ".............C......",
  "...C.......###......",
  ".###................",
  "......###......C....",
  ".............###....",
  "...C................",
  ".###......C.........",
  "........###...E.....",
  "####################",
  "####################",
];

const LEVELS = [LEVEL_1, LEVEL_2];

const PixelQuest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // We use the store for UI, but for the game loop we might need direct access or refs
  const { status, score, lives, level, startGame, resetGame, addScore, loseLife, nextLevel, completeLevel } = useStore();
  
  // Game State Refs (mutable state for the loop)
  const gameState = useRef({
    player: { x: 50, y: 50, vx: 0, vy: 0, width: 20, height: 20, grounded: false },
    keys: {} as { [key: string]: boolean },
    entities: [] as any[],
    levelData: [] as string[],
    camera: { x: 0, y: 0 }
  });

  const requestRef = useRef<number>(0);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- Level Loading ---
  const loadLevel = (lvlIndex: number) => {
    const data = LEVELS[(lvlIndex - 1) % LEVELS.length];
    gameState.current.levelData = data;
    gameState.current.entities = [];
    
    data.forEach((row, y) => {
      row.split('').forEach((char, x) => {
        if (char === 'P') {
          gameState.current.player.x = x * TILE_SIZE;
          gameState.current.player.y = y * TILE_SIZE;
          gameState.current.player.vx = 0;
          gameState.current.player.vy = 0;
        } else if (char === 'C') {
          gameState.current.entities.push({ type: 'COIN', x: x * TILE_SIZE + 8, y: y * TILE_SIZE + 8, width: 16, height: 16, active: true });
        } else if (char === 'E') {
          gameState.current.entities.push({ type: 'EXIT', x: x * TILE_SIZE, y: y * TILE_SIZE, width: 32, height: 32, active: true });
        }
      });
    });
  };

  // --- Game Loop ---
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      loadLevel(level);
      
      const loop = () => {
        update();
        draw();
        requestRef.current = requestAnimationFrame(loop);
      };
      loop();
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, level]);

  // --- Helper Functions ---
  const rectIntersect = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
  };

  const checkCollision = (horizontal: boolean) => {
    const { player, levelData } = gameState.current;

    const startX = Math.floor(player.x / TILE_SIZE);
    const endX = Math.floor((player.x + player.width) / TILE_SIZE);
    const startY = Math.floor(player.y / TILE_SIZE);
    const endY = Math.floor((player.y + player.height) / TILE_SIZE);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < levelData.length && x >= 0 && x < levelData[0].length) {
          if (levelData[y][x] === '#') {
            if (horizontal) {
              if (player.vx > 0) player.x = x * TILE_SIZE - player.width - 0.01;
              else if (player.vx < 0) player.x = (x + 1) * TILE_SIZE + 0.01;
              player.vx = 0;
            } else {
              if (player.vy > 0) {
                player.y = y * TILE_SIZE - player.height - 0.01;
                player.grounded = true;
                player.vy = 0;
              } else if (player.vy < 0) {
                player.y = (y + 1) * TILE_SIZE + 0.01;
                player.vy = 0;
              }
            }
          }
        }
      }
    }
  };

  const update = () => {
    const { player, keys, entities, levelData } = gameState.current;
    
    // Horizontal Movement
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -SPEED;
    else if (keys['ArrowRight'] || keys['KeyD']) player.vx = SPEED;
    else player.vx = 0;

    // Jumping
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.grounded) {
      player.vy = JUMP_FORCE;
      player.grounded = false;
      audio.playJump();
    }

    // Physics
    player.vy += GRAVITY;
    
    // X Collision
    player.x += player.vx;
    checkCollision(true);
    
    // Y Collision
    player.y += player.vy;
    player.grounded = false;
    checkCollision(false);

    // Entity Collision
    entities.forEach(e => {
      if (!e.active) return;
      if (rectIntersect(player.x, player.y, player.width, player.height, e.x, e.y, e.width, e.height)) {
        if (e.type === 'COIN') {
          e.active = false;
          addScore(100);
          audio.playCoin();
        } else if (e.type === 'EXIT') {
          audio.playLevelComplete();
          nextLevel();
        }
      }
    });

    // Void Death
    if (player.y > 600) {
      loseLife();
      audio.playHurt();
      loadLevel(level);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { player, entities, levelData } = gameState.current;

    // Clear
    ctx.fillStyle = '#202028';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Level
    levelData.forEach((row, y) => {
      row.split('').forEach((char, x) => {
        if (char === '#') {
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          // Highlight
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 4);
        }
      });
    });

    // Draw Entities
    entities.forEach(e => {
      if (!e.active) return;
      if (e.type === 'COIN') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/2, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(e.x + e.width/2 - 2, e.y + e.height/2 - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'EXIT') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(e.x + 4, e.y + 4, e.width - 8, e.height - 8);
      }
    });

    // Draw Player
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player Eyes (Directional)
    ctx.fillStyle = 'white';
    const eyeOffset = player.vx < 0 ? 4 : 12;
    ctx.fillRect(player.x + eyeOffset, player.y + 4, 4, 4);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="border-4 border-white/10 shadow-2xl bg-[#202028] rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* HUD */}
        <div className="absolute top-4 left-4 font-mono text-white text-xl drop-shadow-md flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">SCORE</span>
            <span>{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500">LIVES</span>
            <span>{'♥'.repeat(lives)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">LEVEL</span>
            <span>{level}</span>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      {status !== GameStatus.PLAYING && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="text-center p-8 border-4 border-indigo-500 rounded-xl bg-black/90 shadow-[0_0_50px_rgba(79,70,229,0.5)]">
            <h1 className="text-6xl font-bold text-white mb-4 font-pixel text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-purple-600 tracking-tighter">
              PIXEL QUEST
            </h1>
            <p className="text-gray-400 mb-8 font-mono tracking-widest text-sm">
              {status === GameStatus.GAME_OVER ? `GAME OVER - SCORE: ${score}` : 'COLLECT COINS & FIND THE EXIT'}
            </p>
            <button
              onClick={status === GameStatus.GAME_OVER ? resetGame : startGame}
              className="px-8 py-4 bg-indigo-600 text-white font-bold font-pixel hover:bg-indigo-500 hover:scale-105 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 rounded"
            >
              {status === GameStatus.GAME_OVER ? 'TRY AGAIN' : 'START GAME'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelQuest;
