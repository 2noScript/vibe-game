import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Star, Skull, ArrowRight, Timer, Play, Coins } from 'lucide-react';
import { audio } from './audio';

const TILE_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_POWER = -12;
const MIN_JUMP_POWER = -6;
const ACCEL = 0.8;
const FRICTION = 0.85;
const MAX_SPEED = 6;
const MAX_FALL = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

interface LevelData {
  layout: string[];
  theme: 'plains' | 'underground' | 'castle' | 'sky' | 'lava';
  gravity?: number;
  friction?: number;
  speedMultiplier?: number;
}

const LEVELS: LevelData[] = [
  {
    theme: 'plains',
    layout: [
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                     C                                     C                                     C                                     C                                     C                                     C                                     C                                     C                                     C                                      ",
      "                            ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                          ?      BBBBB                                    ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                  ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                          ?   BBBBB                                                                            ",
      "                                                 E                                     E                                     E                                     E                                     E                                     E                                     E                                     E                                     E                          ",
      "                                               ####                                  ####                                  ####                                  ####                                  ####                                  ####                                  ####                                  ####                                  ####                         ",
      "           E                                  #####             E                   #####             E                   #####             E                   #####             E                   #####             E                   #####             E                   #####             E                   #####             E                   #####                        G",
      "########################################################################################################################################################################################################################################################################################################################################################################################################"
    ]
  },
  {
    theme: 'underground',
    friction: 0.98,
    layout: [
      "########################################################################################################################################################################################################################################################################################################################################################################################################",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#           C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C                                                                      #",
      "#          BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB                                                                     #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                   ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?                                                              #",
      "#                  BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB                                                             #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                         E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E                                                        #",
      "#                        BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB             BBB                                                       #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                     G#",
      "########################################################################################################################################################################################################################################################################################################################################################################################################"
    ]
  },
  {
    theme: 'sky',
    gravity: 0.3,
    layout: [
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "             F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F                                                                  ",
      "           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####                                                                ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                         F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F                                                      ",
      "                       #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####                                                    ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                     F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F               F                                          ",
      "                                   #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####           #####                                       G",
      "########################################################################################################################################################################################################################################################################################################################################################################################################"
    ]
  },
  {
    theme: 'lava',
    gravity: 0.8,
    layout: [
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "           ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?                                                                    ",
      "          ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###                                                                   ",
      "                                                                                                                                                                                                                                                                                                                                                                                                        ",
      "                   E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E                                                            ",
      "                  ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###                                                           ",
      "                                                                                                                                                                                                                                                                                                                                                                                                       G",
      "################      ##################      ##################      ##################      ##################      ##################      ##################      ##################      ##################      ##################      ##########################################################################################################################################################"
    ]
  },
  {
    theme: 'castle',
    layout: [
      "########################################################################################################################################################################################################################################################################################################################################################################################################",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#      C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C               C                                                                       #",
      "#     ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###                                                                      #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#             E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E                                                                #",
      "#            ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###                                                               #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                     ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?               ?                                                        #",
      "#                    ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###             ###                                                       #",
      "#                                                                                                                                                                                                                                                                                                                                                                                                      #",
      "#                             E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E               E                                                       G#",
      "########################################################################################################################################################################################################################################################################################################################################################################################################"
    ]
  }
];

interface Character {
  id: string;
  name: string;
  color: string;
  jumpPower: number;
  speed: number;
  gravityMult: number;
  abilities: string[];
}

const CHARACTERS: Character[] = [
  { id: 'jumper', name: 'JUMPER', color: '#f83800', jumpPower: -12, speed: 6, gravityMult: 1, abilities: [] },
  { id: 'speedy', name: 'SPEEDY', color: '#3b82f6', jumpPower: -10, speed: 9, gravityMult: 1.2, abilities: ['sprint'] },
  { id: 'floater', name: 'FLOATER', color: '#22c55e', jumpPower: -14, speed: 4, gravityMult: 0.6, abilities: ['double_jump'] },
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
  state?: any;
}

const SuperJumper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedChar, setSelectedChar] = useState<Character>(CHARACTERS[0]);
  const [gameState, setGameState] = useState<'START' | 'CHAR_SELECT' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'WIN' | 'LEVEL_COMPLETE'>('START');
  const [timeLeft, setTimeLeft] = useState(300);
  
  const stateRef = useRef({
    player: { 
      x: 50, y: 100, width: 30, height: 30, vx: 0, vy: 0, 
      isJumping: false, power: 'normal', invincible: 0, 
      facing: 1, jumpHeld: false, jumpCount: 0, isCrouching: false
    },
    keys: { left: false, right: false, up: false, down: false, shift: false, up_prev: false, p: false },
    cameraX: 0,
    blocks: [] as Entity[],
    coins: [] as Entity[],
    enemies: [] as Entity[],
    particles: [] as any[],
    powerups: [] as Entity[],
    goal: null as Entity | null,
    score: 0,
    lives: 3,
    frame: 0,
    shake: 0,
    timeLeft: 300,
    checkpointX: 50,
    gameState: 'START' as any,
    currentLevel: 0,
    lastTime: 0,
  });

  // Sync stateRef with React state for UI
  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    stateRef.current.currentLevel = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    stateRef.current.lives = lives;
  }, [lives]);

  const initLevel = (lvlIdx: number) => {
    const level = LEVELS[lvlIdx];
    const blocks: Entity[] = [];
    const coins: Entity[] = [];
    const enemies: Entity[] = [];
    const powerups: Entity[] = [];
    let goal: Entity | null = null;

    for (let y = 0; y < level.layout.length; y++) {
      for (let x = 0; x < level.layout[y].length; x++) {
        const char = level.layout[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        
        if (char === '#') {
          blocks.push({ x: px, y: py, width: TILE_SIZE, height: TILE_SIZE, vx: 0, vy: 0, type: 'ground' });
        } else if (char === 'B') {
          blocks.push({ x: px, y: py, width: TILE_SIZE, height: TILE_SIZE, vx: 0, vy: 0, type: 'brick' });
        } else if (char === '?') {
          blocks.push({ x: px, y: py, width: TILE_SIZE, height: TILE_SIZE, vx: 0, vy: 0, type: 'mystery' });
        } else if (char === 'C') {
          coins.push({ x: px + 10, y: py + 10, width: 20, height: 20, vx: 0, vy: 0, type: 'coin' });
        } else if (char === 'E') {
          enemies.push({ x: px, y: py + 10, width: 30, height: 30, vx: -1.5, vy: 0, type: 'enemy' });
        } else if (char === 'F') {
          enemies.push({ x: px, y: py, width: 30, height: 30, vx: -2, vy: 0, type: 'flyer', state: { baseY: py } });
        } else if (char === 'G') {
          goal = { x: px, y: py - TILE_SIZE * 2, width: TILE_SIZE, height: TILE_SIZE * 3, vx: 0, vy: 0, type: 'goal' };
        }
      }
    }

    stateRef.current = {
      ...stateRef.current,
      player: { 
        ...stateRef.current.player,
        x: 50, y: 100, vx: 0, vy: 0, isJumping: false, invincible: 0,
        power: 'normal', height: 30, jumpCount: 0, isCrouching: false
      },
      cameraX: 0,
      blocks,
      coins,
      enemies,
      powerups,
      particles: [],
      goal,
      shake: 0,
      timeLeft: 300,
      checkpointX: 50,
      currentLevel: lvlIdx,
    };
    setTimeLeft(300);
  };

  const startGame = (char: Character) => {
    audio.init();
    setSelectedChar(char);
    setCurrentLevel(0);
    initLevel(0);
    setScore(0);
    stateRef.current.score = 0;
    setLives(3);
    stateRef.current.lives = 3;
    setGameState('PLAYING');
  };

  const nextLevel = () => {
    const nextLvl = currentLevel + 1;
    if (nextLvl < LEVELS.length) {
      setCurrentLevel(nextLvl);
      initLevel(nextLvl);
      setGameState('PLAYING');
    } else {
      setGameState('WIN');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = true;
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = true;
      if (e.key === 'Shift') stateRef.current.keys.shift = true;
      if (e.key === 'p' || e.key === 'P') {
        setGameState(prev => prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev);
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        stateRef.current.keys.up = true;
        stateRef.current.player.jumpHeld = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = false;
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = false;
      if (e.key === 'Shift') stateRef.current.keys.shift = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        stateRef.current.keys.up = false;
        stateRef.current.player.jumpHeld = false;
      }
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

    const spawnParticle = (x: number, y: number, color: string, count = 5) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 25,
          color
        });
      }
    };

    const die = () => {
      const state = stateRef.current;
      if (state.lives > 1) {
        setLives(l => l - 1);
        state.lives -= 1;
        state.player.x = state.checkpointX;
        state.player.y = 100;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.invincible = 60;
        state.player.power = 'normal';
        state.player.height = 30;
        state.timeLeft = 300;
        setTimeLeft(300);
        audio.playHit();
        state.shake = 30;
      } else {
        setGameState('GAME_OVER');
        audio.playGameOver();
      }
    };

    const update = () => {
      const state = stateRef.current;
      if (state.gameState === 'PAUSED') return;
      const { player, keys, blocks, coins, enemies, powerups, particles, goal } = state;
      const level = LEVELS[state.currentLevel];
      state.frame++;

      // Timer logic
      if (state.frame % 60 === 0) {
        state.timeLeft--;
        setTimeLeft(state.timeLeft);
        if (state.timeLeft <= 0) {
          die();
          return;
        }
      }

      // Checkpoint logic (every 1000 pixels)
      if (player.x > state.checkpointX + 1000) {
        state.checkpointX = Math.floor(player.x / 1000) * 1000;
      }

      const currentGravity = (level.gravity || GRAVITY) * selectedChar.gravityMult;
      const currentFriction = level.friction || FRICTION;
      const isSprinting = keys.shift && selectedChar.abilities.includes('sprint');
      const currentAccel = ACCEL * (selectedChar.speed / 6) * (isSprinting ? 1.5 : 1);
      const currentMaxSpeed = selectedChar.speed * (isSprinting ? 1.5 : 1);

      if (state.shake > 0) state.shake--;
      if (player.invincible > 0) player.invincible--;

      // Crouching
      if (keys.down && !player.isJumping) {
        if (!player.isCrouching) {
          player.isCrouching = true;
          player.height = player.power === 'big' ? 30 : 20;
          player.y += player.power === 'big' ? 20 : 10;
        }
      } else if (player.isCrouching) {
        player.isCrouching = false;
        player.y -= player.power === 'big' ? 20 : 10;
        player.height = player.power === 'big' ? 50 : 30;
      }

      // Horizontal movement with acceleration and friction
      if (keys.left) {
        player.vx -= player.isCrouching ? currentAccel * 0.2 : currentAccel;
        player.facing = -1;
      } else if (keys.right) {
        player.vx += player.isCrouching ? currentAccel * 0.2 : currentAccel;
        player.facing = 1;
      } else {
        player.vx *= currentFriction;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }

      if (player.vx > currentMaxSpeed) player.vx = currentMaxSpeed;
      if (player.vx < -currentMaxSpeed) player.vx = -currentMaxSpeed;

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
      player.vy += currentGravity;
      
      // Variable jump height: if button released early, increase gravity
      if (!player.jumpHeld && player.vy < 0) {
        player.vy += currentGravity * 1.5;
      }

      if (player.vy > MAX_FALL) player.vy = MAX_FALL;
      player.y += player.vy;

      player.isJumping = true;

      // Vertical collision
      for (const block of blocks) {
        if (checkCollision(player, block)) {
          if (player.vy > 0) {
            player.y = block.y - player.height;
            player.isJumping = false;
            player.vy = 0;
            player.jumpCount = 0;
          } else if (player.vy < 0) {
            player.y = block.y + block.height;
            player.vy = 0;
            // Hit block from below
            if (block.type === 'mystery') {
              block.type = 'empty';
              state.shake = 5;
              
              // 20% chance for mushroom
              if (Math.random() < 0.3 && player.power === 'normal') {
                powerups.push({
                  x: block.x, y: block.y - TILE_SIZE,
                  width: 30, height: 30, vx: 2, vy: 0, type: 'mushroom'
                });
                audio.playPowerUp();
              } else {
                state.score += 100;
                setScore(state.score);
                audio.playCoin();
                spawnParticle(block.x + TILE_SIZE/2, block.y, '#fce000');
              }
            } else if (block.type === 'brick') {
              if (player.power === 'big') {
                // Break brick
                blocks.splice(blocks.indexOf(block), 1);
                state.score += 50;
                setScore(state.score);
                audio.playStomp(); // Using stomp sound for breaking
                spawnParticle(block.x + TILE_SIZE/2, block.y + TILE_SIZE/2, '#c84c0c', 8);
                state.shake = 3;
              } else {
                // Just bump it
                state.shake = 2;
              }
            }
          }
        }
      }

      // Jumping
      if (keys.up) {
        const canDoubleJump = selectedChar.abilities.includes('double_jump') && player.jumpCount < 2;
        const canNormalJump = !player.isJumping && player.jumpCount === 0;
        
        if (canNormalJump || (canDoubleJump && player.jumpCount > 0 && !state.keys.up_prev)) {
          player.vy = selectedChar.jumpPower;
          player.isJumping = true;
          player.jumpCount++;
          audio.playJump();
          spawnParticle(player.x + player.width/2, player.y + player.height, '#fff', 3);
        }
      }
      state.keys.up_prev = keys.up;

      // Camera scroll
      if (player.x > state.cameraX + CANVAS_WIDTH / 2) {
        state.cameraX = player.x - CANVAS_WIDTH / 2;
      }
      if (player.x < state.cameraX) {
        player.x = state.cameraX;
      }

      // Powerups
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;

        for (const block of blocks) {
          if (checkCollision(p, block)) {
            if (p.vy > 0) {
              p.y = block.y - p.height;
              p.vy = 0;
            } else {
              p.vx *= -1;
            }
          }
        }

        if (checkCollision(player, p)) {
          powerups.splice(i, 1);
          if (p.type === 'mushroom') {
            player.power = 'big';
            player.height = 50;
            player.y -= 20;
            audio.playPowerUp();
            state.score += 500;
            setScore(state.score);
          }
        }
      }

      // Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        if (checkCollision(player, coins[i])) {
          coins.splice(i, 1);
          state.score += 50;
          setScore(state.score);
          audio.playCoin();
        }
      }

      // Enemies
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        
        if (enemy.type === 'flyer') {
          enemy.x += enemy.vx;
          enemy.y = enemy.state.baseY + Math.sin(state.frame * 0.05) * 50;
          if (enemy.x < state.cameraX - 100) enemy.x = state.cameraX + CANVAS_WIDTH + 100;
        } else {
          enemy.vy += GRAVITY;
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;

          for (const block of blocks) {
            if (checkCollision(enemy, block)) {
              if (enemy.vy > 0 && enemy.y + enemy.height - enemy.vy <= block.y) {
                enemy.y = block.y - enemy.height;
                enemy.vy = 0;
              } else {
                enemy.vx *= -1;
              }
            }
          }
        }

        if (checkCollision(player, enemy)) {
          if (player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 15) {
            enemy.dead = true;
            player.vy = JUMP_POWER / 1.5;
            state.score += 200;
            setScore(state.score);
            audio.playStomp();
            spawnParticle(enemy.x + enemy.width/2, enemy.y, '#a81000');
            state.shake = 8;
          } else if (player.invincible <= 0) {
            if (player.power === 'big') {
              player.power = 'normal';
              player.height = 30;
              player.invincible = 120;
              audio.playHit();
              state.shake = 15;
            } else {
              die();
            }
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Goal
      if (goal && checkCollision(player, goal)) {
        setGameState('LEVEL_COMPLETE');
        audio.playLevelClear();
      }

      // Fall off screen or lava hazard
      const isLavaLevel = LEVELS[currentLevel].theme === 'lava';
      if (player.y > CANVAS_HEIGHT || (isLavaLevel && player.y > CANVAS_HEIGHT - 40)) {
        die();
      }
    };

    const draw = () => {
      const state = stateRef.current;
      const { player, cameraX, blocks, coins, enemies, powerups, particles, goal, shake } = state;
      const theme = LEVELS[currentLevel].theme;

      // Screen Shake
      const sx = (Math.random() - 0.5) * shake;
      const sy = (Math.random() - 0.5) * shake;

      // Clear canvas
      let bg = '#5c94fc';
      if (theme === 'underground') bg = '#000';
      else if (theme === 'castle') bg = '#1a1a1a';
      else if (theme === 'sky') bg = '#87ceeb';
      else if (theme === 'lava') bg = '#300';
      
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw lava floor
      if (theme === 'lava') {
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(cameraX, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
        // Glow
        const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 60, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(cameraX, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 40);
      }

      ctx.save();
      ctx.translate(-cameraX + sx, sy);

      // Parallax Clouds/Background
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      for (let i = 0; i < 10; i++) {
        const px = (i * 400 - cameraX * 0.2) % (LEVELS[currentLevel].layout[0].length * TILE_SIZE);
        ctx.beginPath();
        ctx.arc(px, 100 + i * 20, 40, 0, Math.PI * 2);
        ctx.arc(px + 30, 110 + i * 20, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw blocks
      for (const block of blocks) {
        if (block.type === 'ground') {
          ctx.fillStyle = theme === 'underground' ? '#444' : theme === 'lava' ? '#922' : '#c84c0c';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.strokeRect(block.x, block.y, block.width, block.height);
          // Texture
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.fillRect(block.x + 4, block.y + 4, 12, 12);
        } else if (block.type === 'brick') {
          ctx.fillStyle = theme === 'underground' ? '#666' : '#c84c0c';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.strokeRect(block.x, block.y, block.width, block.height);
          // Brick lines
          ctx.beginPath();
          ctx.moveTo(block.x, block.y + TILE_SIZE/2);
          ctx.lineTo(block.x + TILE_SIZE, block.y + TILE_SIZE/2);
          ctx.moveTo(block.x + TILE_SIZE/2, block.y);
          ctx.lineTo(block.x + TILE_SIZE/2, block.y + TILE_SIZE/2);
          ctx.moveTo(block.x + TILE_SIZE/4, block.y + TILE_SIZE/2);
          ctx.lineTo(block.x + TILE_SIZE/4, block.y + TILE_SIZE);
          ctx.stroke();
        } else if (block.type === 'mystery') {
          ctx.fillStyle = '#fc9838';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', block.x + TILE_SIZE/2, block.y + 30);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(block.x, block.y, block.width, block.height);
        } else if (block.type === 'empty') {
          ctx.fillStyle = '#888';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
      }

      // Draw powerups
      for (const p of powerups) {
        if (p.type === 'mushroom') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillRect(p.x + 5, p.y + 5, 8, 8);
          ctx.fillRect(p.x + 18, p.y + 15, 8, 8);
        }
      }

      // Draw coins
      for (const coin of coins) {
        ctx.fillStyle = '#fce000';
        ctx.beginPath();
        const bounce = Math.sin(state.frame * 0.1) * 5;
        ctx.ellipse(coin.x + coin.width / 2, coin.y + coin.height / 2 + bounce, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8a000';
        ctx.stroke();
      }

      // Draw enemies
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        ctx.fillStyle = enemy.type === 'flyer' ? '#8b5cf6' : '#a81000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 8);
        ctx.fillRect(enemy.x + 18, enemy.y + 4, 8, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 4, 4);
        ctx.fillRect(enemy.x + 22, enemy.y + 8, 4, 4);
        
        if (enemy.type === 'flyer') {
          // Wings
          ctx.fillStyle = '#ddd';
          ctx.fillRect(enemy.x - 10, enemy.y + 5, 10, 10);
          ctx.fillRect(enemy.x + enemy.width, enemy.y + 5, 10, 10);
        }
      }

      // Draw goal
      if (goal) {
        ctx.fillStyle = '#000';
        ctx.fillRect(goal.x, goal.y, 4, goal.height);
        ctx.fillStyle = '#00a800';
        const flagY = goal.y + 10 + Math.sin(state.frame * 0.05) * 10;
        ctx.fillRect(goal.x + 4, flagY, 40, 30);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('GOAL', goal.x + 24, flagY + 20);
      }

      // Draw particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 25;
        ctx.fillRect(p.x, p.y, 4, 4);
      }
      ctx.globalAlpha = 1.0;

      // Draw player
      if (player.invincible <= 0 || Math.floor(state.frame / 5) % 2 === 0) {
        const isBig = player.power === 'big';
        const charColor = selectedChar.color;
        ctx.fillStyle = isBig ? '#f59e0b' : charColor;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Face
        ctx.fillStyle = '#fca044';
        ctx.fillRect(player.x + 4, player.y + 4, player.width - 8, 14);
        
        // Eye
        ctx.fillStyle = '#000';
        const eyeX = player.facing === 1 ? player.x + player.width - 10 : player.x + 6;
        ctx.fillRect(eyeX, player.y + 8, 4, 4);
        
        // Overalls
        ctx.fillStyle = isBig ? '#7c2d12' : '#0000a8';
        ctx.fillRect(player.x + 4, player.y + 18, player.width - 8, player.height - 18);
        
        // Hat
        ctx.fillStyle = isBig ? '#f59e0b' : charColor;
        ctx.fillRect(player.x, player.y, player.width, 6);
      }

      ctx.restore();
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentLevel]);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center font-pixel text-white">
      {/* HUD */}
      {gameState !== 'START' && gameState !== 'CHAR_SELECT' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-2">
            <div className="bg-black/50 backdrop-blur-md border border-white/20 p-3 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <Coins className="w-5 h-5 text-yellow-900" />
                </div>
                <span className="text-2xl font-bold text-white tabular-nums">{score}</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <span className="text-2xl font-bold text-white">{lives}</span>
              </div>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-xl inline-flex items-center gap-2 w-fit">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Level</span>
              <span className="text-lg font-bold text-white">{currentLevel + 1}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="bg-black/50 backdrop-blur-md border border-white/20 p-3 rounded-xl flex items-center gap-3">
              <Timer className="w-6 h-6 text-blue-400" />
              <span className={`text-2xl font-bold tabular-nums ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
              Press P to Pause
            </div>
          </div>
        </div>
      )}

      <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border-8 border-zinc-800 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-black"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Overlays */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">PAUSED</h2>
              <p className="text-zinc-400 mb-8">Take a breather, hero!</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
                >
                  <Play className="w-5 h-5 fill-current" />
                  RESUME GAME
                </button>
                
                <button
                  onClick={() => setGameState('START')}
                  className="w-full bg-zinc-800 text-white font-bold py-4 rounded-2xl hover:bg-zinc-700 transition-all"
                >
                  QUIT TO MENU
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {gameState === 'START' && (
          <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-8xl font-black text-red-600 mb-2 italic tracking-tighter drop-shadow-[8px_8px_0_#000]">SUPER</h1>
              <h1 className="text-8xl font-black text-blue-500 mb-8 italic tracking-tighter drop-shadow-[8px_8px_0_#000]">JUMPER</h1>
              
              <button
                onClick={() => setGameState('CHAR_SELECT')}
                className="group relative px-12 py-6 bg-white text-black font-black text-3xl hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:skew-x-[-10deg]"
              >
                <span className="relative z-10">SELECT CHARACTER</span>
                <div className="absolute inset-0 bg-red-600 transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'CHAR_SELECT' && (
          <div className="absolute inset-0 bg-[#050505]/95 flex flex-col items-center justify-center backdrop-blur-xl">
            <h2 className="text-4xl font-black text-white mb-12 italic tracking-tighter">CHOOSE YOUR HERO</h2>
            <div className="flex gap-8">
              {CHARACTERS.map((char) => (
                <motion.div
                  key={char.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-xl flex flex-col items-center w-48 cursor-pointer hover:border-white/50 transition-colors"
                  onClick={() => startGame(char)}
                >
                  <div 
                    className="w-20 h-20 mb-4 rounded-lg shadow-lg"
                    style={{ backgroundColor: char.color }}
                  />
                  <h3 className="text-xl font-bold mb-4">{char.name}</h3>
                  <div className="text-[10px] text-zinc-500 flex flex-col gap-1 uppercase tracking-widest">
                    <div className="flex justify-between gap-4"><span>SPEED</span> <span className="text-white">{char.speed}</span></div>
                    <div className="flex justify-between gap-4"><span>JUMP</span> <span className="text-white">{Math.abs(char.jumpPower)}</span></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'LEVEL_COMPLETE' && (
          <div className="absolute inset-0 bg-blue-600/90 flex flex-col items-center justify-center backdrop-blur-sm">
            <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
            <h2 className="text-6xl font-black text-white mb-2 italic tracking-tighter">WORLD {currentLevel + 1}-1</h2>
            <h3 className="text-4xl font-bold text-blue-200 mb-12">MISSION ACCOMPLISHED</h3>
            <button
              onClick={nextLevel}
              className="px-12 py-6 bg-white text-blue-600 font-black text-3xl hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-4 transform hover:scale-110"
            >
              NEXT WORLD <ArrowRight size={32} />
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center backdrop-blur-sm">
            <Skull size={80} className="text-black mb-6 animate-pulse" />
            <h2 className="text-8xl font-black text-black mb-4 italic tracking-tighter">WASTED</h2>
            <p className="text-white mb-12 text-2xl font-bold tracking-widest">FINAL SCORE: {score}</p>
            <button
              onClick={() => setGameState('CHAR_SELECT')}
              className="px-12 py-6 bg-black text-white font-black text-3xl hover:bg-white hover:text-black transition-all border-4 border-black transform hover:rotate-3"
            >
              RETRY MISSION
            </button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-yellow-400/95 flex flex-col items-center justify-center backdrop-blur-md">
            <Star size={100} className="text-black mb-8 animate-spin" />
            <h2 className="text-8xl font-black text-black mb-4 italic tracking-tighter">LEGENDARY</h2>
            <p className="text-black/60 mb-2 text-2xl font-bold">ALL WORLDS DOMINATED</p>
            <p className="text-black mb-12 text-4xl font-black tracking-tighter">SCORE: {score}</p>
            <button
              onClick={() => setGameState('START')}
              className="px-12 py-6 bg-black text-white font-black text-3xl hover:bg-white hover:text-black transition-all transform hover:scale-110"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperJumper;
