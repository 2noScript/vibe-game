import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Heart } from 'lucide-react';

const TILE_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_POWER = -12;
const SPEED = 5;
const MAX_FALL = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const LEVEL = [
  "                                                                                                    ",
  "                                                                                                    ",
  "                                                                                                    ",
  "                                                                                                    ",
  "                                                                                                    ",
  "                                                                                                    ",
  "                                                                                                    ",
  "                                     C                                                              ",
  "                            ?       ###                                                             ",
  "                                                                                                    ",
  "                  ?   #?#?#                                                                         ",
  "                                                 E                                                  ",
  "                                               ####                                                 ",
  "           E                                  #####                                                G",
  "####################################################################################################"
];

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: string;
  dead?: boolean;
}

const SuperMario = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('START');
  
  const stateRef = useRef({
    player: { x: 50, y: 100, width: 30, height: 30, vx: 0, vy: 0, isJumping: false },
    keys: { left: false, right: false, up: false },
    cameraX: 0,
    blocks: [] as Entity[],
    coins: [] as Entity[],
    enemies: [] as Entity[],
    goal: null as Entity | null,
    score: 0,
  });

  const initLevel = () => {
    const blocks: Entity[] = [];
    const coins: Entity[] = [];
    const enemies: Entity[] = [];
    let goal: Entity | null = null;

    for (let y = 0; y < LEVEL.length; y++) {
      for (let x = 0; x < LEVEL[y].length; x++) {
        const char = LEVEL[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        
        if (char === '#') {
          blocks.push({ x: px, y: py, width: TILE_SIZE, height: TILE_SIZE, vx: 0, vy: 0, type: 'ground' });
        } else if (char === '?') {
          blocks.push({ x: px, y: py, width: TILE_SIZE, height: TILE_SIZE, vx: 0, vy: 0, type: 'mystery' });
        } else if (char === 'C') {
          coins.push({ x: px + 10, y: py + 10, width: 20, height: 20, vx: 0, vy: 0, type: 'coin' });
        } else if (char === 'E') {
          enemies.push({ x: px, y: py + 10, width: 30, height: 30, vx: -1, vy: 0, type: 'enemy' });
        } else if (char === 'G') {
          goal = { x: px, y: py - TILE_SIZE * 2, width: TILE_SIZE, height: TILE_SIZE * 3, vx: 0, vy: 0, type: 'goal' };
        }
      }
    }

    stateRef.current = {
      ...stateRef.current,
      player: { x: 50, y: 100, width: 30, height: 30, vx: 0, vy: 0, isJumping: false },
      cameraX: 0,
      blocks,
      coins,
      enemies,
      goal,
    };
  };

  const startGame = () => {
    initLevel();
    setScore(0);
    stateRef.current.score = 0;
    setLives(3);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') stateRef.current.keys.up = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') stateRef.current.keys.up = false;
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

    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const update = () => {
      const state = stateRef.current;
      const { player, keys, blocks, coins, enemies, goal } = state;

      // Horizontal movement
      if (keys.left) player.vx = -SPEED;
      else if (keys.right) player.vx = SPEED;
      else player.vx = 0;

      player.x += player.vx;

      // Horizontal collision
      for (const block of blocks) {
        if (checkCollision(player, block)) {
          if (player.vx > 0) player.x = block.x - player.width;
          else if (player.vx < 0) player.x = block.x + block.width;
          player.vx = 0;
        }
      }

      // Vertical movement
      player.vy += GRAVITY;
      if (player.vy > MAX_FALL) player.vy = MAX_FALL;
      player.y += player.vy;

      player.isJumping = true;

      // Vertical collision
      for (const block of blocks) {
        if (checkCollision(player, block)) {
          if (player.vy > 0) {
            player.y = block.y - player.height;
            player.isJumping = false;
          } else if (player.vy < 0) {
            player.y = block.y + block.height;
            // Hit block from below
            if (block.type === 'mystery') {
              block.type = 'empty';
              state.score += 100;
              setScore(state.score);
            }
          }
          player.vy = 0;
        }
      }

      // Jumping
      if (keys.up && !player.isJumping) {
        player.vy = JUMP_POWER;
        player.isJumping = true;
      }

      // Camera scroll
      if (player.x > state.cameraX + CANVAS_WIDTH / 2) {
        state.cameraX = player.x - CANVAS_WIDTH / 2;
      }
      if (player.x < state.cameraX) {
        player.x = state.cameraX; // Prevent going back too far
      }

      // Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        if (checkCollision(player, coins[i])) {
          coins.splice(i, 1);
          state.score += 50;
          setScore(state.score);
        }
      }

      // Enemies
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        
        // Enemy movement
        enemy.vy += GRAVITY;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Enemy collision with blocks
        let enemyOnGround = false;
        for (const block of blocks) {
          if (checkCollision(enemy, block)) {
            if (enemy.vy > 0 && enemy.y + enemy.height - enemy.vy <= block.y) {
              enemy.y = block.y - enemy.height;
              enemy.vy = 0;
              enemyOnGround = true;
            } else {
              enemy.vx *= -1; // Turn around
            }
          }
        }

        // Player collision with enemy
        if (checkCollision(player, enemy)) {
          if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 10) {
            // Stomp
            enemy.dead = true;
            player.vy = JUMP_POWER / 1.5; // Bounce
            state.score += 200;
            setScore(state.score);
          } else {
            // Player hit
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('GAME_OVER');
              } else {
                // Reset player position
                player.x = state.cameraX + 50;
                player.y = 100;
                player.vx = 0;
                player.vy = 0;
              }
              return newLives;
            });
          }
        }
      }

      // Goal
      if (goal && checkCollision(player, goal)) {
        setGameState('WIN');
      }

      // Fall off screen
      if (player.y > CANVAS_HEIGHT) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameState('GAME_OVER');
          } else {
            player.x = state.cameraX + 50;
            player.y = 100;
            player.vx = 0;
            player.vy = 0;
          }
          return newLives;
        });
      }
    };

    const draw = () => {
      const state = stateRef.current;
      const { player, cameraX, blocks, coins, enemies, goal } = state;

      // Clear canvas
      ctx.fillStyle = '#5c94fc'; // Sky blue
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw blocks
      for (const block of blocks) {
        if (block.type === 'ground') {
          ctx.fillStyle = '#c84c0c';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(block.x, block.y, block.width, block.height);
        } else if (block.type === 'mystery') {
          ctx.fillStyle = '#fc9838';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.fillStyle = '#fff';
          ctx.font = '20px Arial';
          ctx.fillText('?', block.x + 12, block.y + 28);
        } else if (block.type === 'empty') {
          ctx.fillStyle = '#888';
          ctx.fillRect(block.x, block.y, block.width, block.height);
        }
      }

      // Draw coins
      ctx.fillStyle = '#fce000';
      for (const coin of coins) {
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8a000';
        ctx.stroke();
      }

      // Draw enemies
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        ctx.fillStyle = '#a81000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 8);
        ctx.fillRect(enemy.x + 18, enemy.y + 4, 8, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
        ctx.fillRect(enemy.x + 22, enemy.y + 8, 4, 4);
      }

      // Draw goal
      if (goal) {
        ctx.fillStyle = '#000';
        ctx.fillRect(goal.x, goal.y, 4, goal.height); // Pole
        ctx.fillStyle = '#00a800';
        ctx.fillRect(goal.x + 4, goal.y + 10, 40, 30); // Flag
      }

      // Draw player
      ctx.fillStyle = '#f83800'; // Red shirt
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#fca044'; // Face
      ctx.fillRect(player.x + 4, player.y + 4, 22, 14);
      ctx.fillStyle = '#000'; // Eye
      ctx.fillRect(player.x + (player.vx < 0 ? 6 : 20), player.y + 8, 4, 4);
      ctx.fillStyle = '#0000a8'; // Overalls
      ctx.fillRect(player.x + 4, player.y + 18, 22, 12);

      ctx.restore();
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center font-pixel text-white">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 px-8">
        <div className="flex gap-8 text-xl">
          <div>
            <div className="text-red-500">SCORE</div>
            <div>{score.toString().padStart(6, '0')}</div>
          </div>
          <div>
            <div className="text-yellow-400">WORLD</div>
            <div>1-1</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xl">
          <Heart className="text-red-500" fill="currentColor" />
          <span>x {lives}</span>
        </div>
      </div>

      <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 rounded-lg overflow-hidden">
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
            <h1 className="text-6xl font-bold text-red-500 mb-4 drop-shadow-[4px_4px_0_#000]">SUPER JUMPER</h1>
            <p className="text-yellow-400 mb-8 text-xl">USE ARROWS TO MOVE. UP TO JUMP.</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 text-black font-bold text-2xl hover:bg-green-400 hover:scale-105 transition-all"
            >
              START GAME
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
            <h2 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <p className="text-white mb-8 text-2xl">SCORE: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-white text-black font-bold text-2xl hover:bg-gray-200 hover:scale-105 transition-all"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
            <h2 className="text-6xl font-bold text-green-500 mb-4">LEVEL CLEARED!</h2>
            <p className="text-white mb-8 text-2xl">FINAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-white text-black font-bold text-2xl hover:bg-gray-200 hover:scale-105 transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperMario;
