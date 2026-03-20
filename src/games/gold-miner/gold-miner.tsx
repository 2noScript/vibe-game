import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Clock, Target, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './audio';
import { cn } from '../../lib/utils';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ORIGIN_X = CANVAS_WIDTH / 2;
const ORIGIN_Y = 80;
const CLAW_SPEED = 12;
const SWING_SPEED = 0.035;
const MAX_ANGLE = Math.PI / 2.2;

type ItemType = 'gold_large' | 'gold_medium' | 'gold_small' | 'rock_large' | 'rock_small' | 'diamond' | 'mystery';

interface Item {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number;
  color: string;
  rotation: number;
  points: { x: number; y: number }[]; // For irregular shapes
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

interface GameState {
  status: 'START' | 'PLAYING' | 'LEVEL_CLEAR' | 'GAME_OVER' | 'WIN';
  level: number;
  score: number;
  goal: number;
  time: number;
}

const ITEM_DEFS: Record<ItemType, Omit<Item, 'id' | 'x' | 'y' | 'rotation' | 'points'>> = {
  gold_large: { type: 'gold_large', radius: 45, value: 500, weight: 0.25, color: '#FFD700' },
  gold_medium: { type: 'gold_medium', radius: 28, value: 250, weight: 0.45, color: '#FFD700' },
  gold_small: { type: 'gold_small', radius: 16, value: 50, weight: 0.85, color: '#FFD700' },
  rock_large: { type: 'rock_large', radius: 50, value: 20, weight: 0.12, color: '#8B7D7B' },
  rock_small: { type: 'rock_small', radius: 26, value: 11, weight: 0.35, color: '#8B7D7B' },
  diamond: { type: 'diamond', radius: 12, value: 600, weight: 1.0, color: '#E0FFFF' },
  mystery: { type: 'mystery', radius: 20, value: 0, weight: 0.6, color: '#9370DB' },
};

const generateIrregularPoints = (radius: number, pointsCount: number = 8) => {
  const points = [];
  for (let i = 0; i < pointsCount; i++) {
    const angle = (i / pointsCount) * Math.PI * 2;
    const r = radius * (0.8 + Math.random() * 0.4);
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }
  return points;
};

const generateLevel = (level: number): Item[] => {
  const items: Item[] = [];
  let idCounter = 0;

  const addItem = (type: ItemType, count: number) => {
    for (let i = 0; i < count; i++) {
      items.push({
        id: idCounter++,
        ...ITEM_DEFS[type],
        x: Math.random() * (CANVAS_WIDTH - 120) + 60,
        y: Math.random() * (CANVAS_HEIGHT - 250) + 180,
        rotation: Math.random() * Math.PI * 2,
        points: generateIrregularPoints(ITEM_DEFS[type].radius, type.includes('gold') ? 10 : 6)
      });
    }
  };

  addItem('gold_large', 1 + Math.floor(level / 2));
  addItem('gold_medium', 2 + Math.floor(level / 2));
  addItem('gold_small', 3 + level);
  addItem('rock_large', 1 + level);
  addItem('rock_small', 2 + level);
  
  if (level > 1) {
    addItem('diamond', Math.floor(level / 2));
  }
  if (level > 2) {
    addItem('mystery', 1);
  }

  return items;
};

const GoldMiner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    level: 1,
    score: 0,
    goal: 650,
    time: 60,
  });

  const stateRef = useRef({
    angle: 0,
    angleDir: 1,
    clawState: 'swinging' as 'swinging' | 'shooting' | 'retracting',
    clawLength: 60,
    grabbedItem: null as Item | null,
    items: [] as Item[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    screenShake: 0,
    minerFrame: 0,
    lastTime: 0,
  });

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      stateRef.current.particles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3
      });
    }
  };

  const createFloatingText = (x: number, y: number, text: string, color: string) => {
    stateRef.current.floatingTexts.push({
      id: Math.random(),
      x,
      y,
      text,
      life: 1,
      color
    });
  };

  const startGame = () => {
    audio.init();
    setGameState({
      status: 'PLAYING',
      level: 1,
      score: 0,
      goal: 650,
      time: 60,
    });
    stateRef.current.items = generateLevel(1);
    stateRef.current.clawState = 'swinging';
    stateRef.current.clawLength = 60;
    stateRef.current.grabbedItem = null;
    stateRef.current.particles = [];
    stateRef.current.floatingTexts = [];
  };

  const nextLevel = () => {
    audio.init();
    const nextLvl = gameState.level + 1;
    setGameState(prev => ({
      ...prev,
      status: 'PLAYING',
      level: nextLvl,
      goal: prev.goal + nextLvl * 500 + 200,
      time: 60,
    }));
    stateRef.current.items = generateLevel(nextLvl);
    stateRef.current.clawState = 'swinging';
    stateRef.current.clawLength = 60;
    stateRef.current.grabbedItem = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      if ((e.key === 'ArrowDown' || e.key === ' ') && stateRef.current.clawState === 'swinging' && gameState.status === 'PLAYING') {
        stateRef.current.clawState = 'shooting';
        audio.playShoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.time <= 1) {
          clearInterval(timer);
          if (prev.score >= prev.goal) {
            audio.playLevelClear();
            return { ...prev, status: 'LEVEL_CLEAR', time: 0 };
          } else {
            audio.playGameOver();
            return { ...prev, status: 'GAME_OVER', time: 0 };
          }
        }
        return { ...prev, time: prev.time - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const update = (dt: number) => {
      const state = stateRef.current;

      // Update Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        return p.life > 0;
      });

      // Update Floating Texts
      state.floatingTexts = state.floatingTexts.filter(t => {
        t.y -= 1;
        t.life -= 0.015;
        return t.life > 0;
      });

      if (state.screenShake > 0) state.screenShake -= 0.5;

      if (state.clawState === 'swinging') {
        state.angle += SWING_SPEED * state.angleDir;
        if (state.angle > MAX_ANGLE) {
          state.angle = MAX_ANGLE;
          state.angleDir = -1;
        } else if (state.angle < -MAX_ANGLE) {
          state.angle = -MAX_ANGLE;
          state.angleDir = 1;
        }
      } else if (state.clawState === 'shooting') {
        state.clawLength += CLAW_SPEED;
        
        const clawX = ORIGIN_X + Math.sin(state.angle) * state.clawLength;
        const clawY = ORIGIN_Y + Math.cos(state.angle) * state.clawLength;

        if (clawX < 0 || clawX > CANVAS_WIDTH || clawY > CANVAS_HEIGHT) {
          state.clawState = 'retracting';
        }

        for (let i = 0; i < state.items.length; i++) {
          const item = state.items[i];
          const dist = Math.hypot(clawX - item.x, clawY - item.y);
          if (dist < item.radius + 15) {
            state.grabbedItem = item;
            state.items.splice(i, 1);
            state.clawState = 'retracting';
            
            if (item.type === 'mystery') {
              const values = [1, 50, 100, 500, 800];
              item.value = values[Math.floor(Math.random() * values.length)];
            }

            if (item.type.includes('gold')) {
              audio.playGrabGold();
              createParticles(item.x, item.y, '#FFD700', 15);
            } else if (item.type.includes('rock')) {
              audio.playGrabRock();
              createParticles(item.x, item.y, '#8B7D7B', 10);
              state.screenShake = 5;
            } else if (item.type === 'diamond') {
              audio.playGrabDiamond();
              createParticles(item.x, item.y, '#E0FFFF', 20);
            }
            audio.startReel(item.weight);
            break;
          }
        }
      } else if (state.clawState === 'retracting') {
        const speed = state.grabbedItem ? CLAW_SPEED * state.grabbedItem.weight : CLAW_SPEED;
        state.clawLength -= speed;
        
        // Miner animation frame
        state.minerFrame += 0.2;

        if (state.clawLength <= 60) {
          state.clawLength = 60;
          state.clawState = 'swinging';
          audio.stopReel();
          
          if (state.grabbedItem) {
            const itemValue = state.grabbedItem.value;
            setGameState(prev => ({ ...prev, score: prev.score + itemValue }));
            createFloatingText(ORIGIN_X, ORIGIN_Y - 40, `+$${itemValue}`, itemValue > 100 ? '#4ade80' : '#fff');
            state.grabbedItem = null;
            audio.playScore();
          }

          // Check if all items are cleared
          if (state.items.length === 0 && state.grabbedItem === null) {
            setGameState(prev => {
              if (prev.status !== 'PLAYING') return prev;
              if (prev.score >= prev.goal) {
                audio.playLevelClear();
                return { ...prev, status: 'LEVEL_CLEAR' };
              } else {
                audio.playGameOver();
                return { ...prev, status: 'GAME_OVER' };
              }
            });
          }
        }
      }
    };

    const draw = () => {
      const state = stateRef.current;
      ctx.save();
      
      // Screen Shake
      if (state.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
      }

      // Background - Deep Dirt
      const bgGradient = ctx.createLinearGradient(0, 70, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, '#5c3a21');
      bgGradient.addColorStop(1, '#2c1a0b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 70, CANVAS_WIDTH, CANVAS_HEIGHT - 70);

      // Top Ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 70);
      ctx.fillStyle = '#228B22'; // Grass
      ctx.fillRect(0, 0, CANVAS_WIDTH, 10);

      // Draw Fossils/Roots in background
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      // Simple roots
      ctx.beginPath();
      ctx.moveTo(100, 70); ctx.quadraticCurveTo(120, 150, 80, 250);
      ctx.moveTo(600, 70); ctx.quadraticCurveTo(580, 200, 650, 400);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw items
      for (const item of state.items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        
        ctx.beginPath();
        if (item.type === 'diamond') {
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius, 0);
          ctx.lineTo(0, item.radius);
          ctx.lineTo(-item.radius, 0);
          ctx.closePath();
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, item.radius);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(1, '#00ffff');
          ctx.fillStyle = grad;
        } else if (item.type === 'mystery') {
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#9370DB';
        } else {
          // Irregular shape for gold/rocks
          ctx.moveTo(item.points[0].x, item.points[0].y);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
          }
          ctx.closePath();
          
          const grad = ctx.createRadialGradient(-item.radius/3, -item.radius/3, 0, 0, 0, item.radius);
          if (item.type.includes('gold')) {
            grad.addColorStop(0, '#FFF700');
            grad.addColorStop(1, '#B8860B');
          } else {
            grad.addColorStop(0, '#A9A9A9');
            grad.addColorStop(1, '#4F4F4F');
          }
          ctx.fillStyle = grad;
        }
        
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Highlights
        if (item.type.includes('gold')) {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.ellipse(-item.radius/2, -item.radius/2, item.radius/4, item.radius/6, Math.PI/4, 0, Math.PI*2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      // Draw Rope
      const clawX = ORIGIN_X + Math.sin(state.angle) * state.clawLength;
      const clawY = ORIGIN_Y + Math.cos(state.angle) * state.clawLength;

      // Rope vibration when pulling
      let ropeX = clawX;
      if (state.clawState === 'retracting' && state.grabbedItem) {
        ropeX += Math.sin(Date.now() * 0.1) * 2;
      }

      ctx.beginPath();
      ctx.moveTo(ORIGIN_X, ORIGIN_Y);
      ctx.lineTo(ropeX, clawY);
      ctx.strokeStyle = '#4a2c1a';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Rope texture
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#6b4423';
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Claw
      ctx.save();
      ctx.translate(ropeX, clawY);
      ctx.rotate(-state.angle);
      
      // Claw Base
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI, true);
      ctx.fill();
      
      // Mechanical arms
      const armAngle = (state.clawState === 'retracting' || state.grabbedItem) ? 0.3 : 0.8;
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      
      // Left arm
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-18 * Math.sin(armAngle), 20 * Math.cos(armAngle));
      ctx.lineTo(-12 * Math.sin(armAngle), 25 * Math.cos(armAngle));
      ctx.stroke();
      
      // Right arm
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(18 * Math.sin(armAngle), 20 * Math.cos(armAngle));
      ctx.lineTo(12 * Math.sin(armAngle), 25 * Math.cos(armAngle));
      ctx.stroke();
      
      ctx.restore();

      // Draw grabbed item
      if (state.grabbedItem) {
        const item = state.grabbedItem;
        ctx.save();
        ctx.translate(ropeX, clawY + item.radius - 5);
        ctx.rotate(item.rotation);
        
        ctx.beginPath();
        if (item.type === 'diamond') {
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius, 0);
          ctx.lineTo(0, item.radius);
          ctx.lineTo(-item.radius, 0);
          ctx.closePath();
          ctx.fillStyle = '#00ffff';
        } else if (item.type === 'mystery') {
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#9370DB';
        } else {
          ctx.moveTo(item.points[0].x, item.points[0].y);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = item.color;
        }
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Miner
      ctx.save();
      ctx.translate(ORIGIN_X, ORIGIN_Y - 25);
      
      // Cart/Stool
      ctx.fillStyle = '#4a2c1a';
      ctx.fillRect(-35, 0, 70, 25);
      ctx.strokeStyle = '#2c1a0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, 0, 70, 25);
      
      // Miner Animation Logic
      const isPulling = state.clawState === 'retracting' && state.grabbedItem;
      const pullIntensity = isPulling ? (1.1 - state.grabbedItem!.weight) * 10 : 0;
      const leanAngle = isPulling ? Math.sin(state.minerFrame) * 0.15 - 0.1 : 0;
      
      ctx.rotate(leanAngle);
      
      // Body (Red Shirt)
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.roundRect(-15, -35, 30, 35, 5);
      ctx.fill();
      
      // Overalls (Blue)
      ctx.fillStyle = '#0044cc';
      ctx.fillRect(-15, -15, 30, 15); // Bottom part
      ctx.fillRect(-15, -35, 8, 20);  // Left strap
      ctx.fillRect(7, -35, 8, 20);   // Right strap
      
      // Head
      ctx.save();
      ctx.translate(0, -42);
      
      // Face
      ctx.fillStyle = '#ffdbac';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Beard (Iconic)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.quadraticCurveTo(0, 18, 10, 2);
      ctx.lineTo(10, -2);
      ctx.lineTo(-10, -2);
      ctx.fill();
      
      // Nose
      ctx.fillStyle = '#ffad60';
      ctx.beginPath();
      ctx.arc(0, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      if (isPulling) {
        // Straining eyes
        ctx.moveTo(-6, -5); ctx.lineTo(-2, -3);
        ctx.moveTo(6, -5); ctx.lineTo(2, -3);
        ctx.stroke();
      } else {
        ctx.arc(-4, -5, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Hat (Old Miner Style)
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.ellipse(0, -10, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(0, -12, 10, Math.PI, 0);
      ctx.fill();
      
      ctx.restore(); // End Head
      
      // Arms (Pulling Action)
      ctx.strokeStyle = '#ffdbac';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      
      const armY = -25 + (isPulling ? Math.sin(state.minerFrame) * 3 : 0);
      ctx.beginPath();
      ctx.moveTo(-15, -25);
      ctx.lineTo(0, armY);
      ctx.lineTo(15, -25);
      ctx.stroke();
      
      // Sweat particles when pulling heavy items
      if (isPulling && state.grabbedItem!.weight < 0.4 && Math.random() > 0.8) {
        createParticles(0, -50, '#00ffff', 1);
      }
      
      ctx.restore();

      // Draw Particles
      for (const p of state.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Draw Floating Texts
      for (const t of state.floatingTexts) {
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 20px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    const loop = (time: number) => {
      update(0.016);
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState.status]);

  return (
    <div className="relative w-full h-screen bg-[#050011] flex items-center justify-center font-pixel text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#8B4513_0%,_transparent_70%)]" />
      </div>

      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
        <div className="flex flex-col gap-3">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 border-2 border-yellow-500/30 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.1)]"
          >
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/40">
              <Trophy className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">CURRENT SCORE</p>
              <p className="text-2xl font-bold text-yellow-400 tracking-tighter">${gameState.score}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 border-2 border-emerald-500/30 rounded-xl"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/40">
              <Target className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">GOAL</p>
              <p className="text-lg font-bold text-emerald-400 tracking-tighter">${gameState.goal}</p>
            </div>
          </motion.div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 border-2 border-white/10 rounded-xl"
          >
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">LEVEL</p>
              <p className="text-2xl font-bold text-white tracking-tighter">{gameState.level.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <Zap className="text-white" size={24} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 border-2 rounded-xl transition-colors duration-300",
              gameState.time <= 10 ? "border-red-500/50 animate-pulse" : "border-blue-500/30"
            )}
          >
            <div className="text-right">
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">TIME LEFT</p>
              <p className={cn("text-lg font-bold tracking-tighter", gameState.time <= 10 ? "text-red-500" : "text-blue-400")}>
                {gameState.time}S
              </p>
            </div>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", gameState.time <= 10 ? "bg-red-500/20 border-red-500/40" : "bg-blue-500/20 border-blue-500/40")}>
              <Clock size={20} className={gameState.time <= 10 ? "text-red-500" : "text-blue-400"} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative group">
        {/* Decorative Frame */}
        <div className="absolute -inset-4 border-4 border-[#5c3a21] rounded-2xl pointer-events-none" />
        <div className="absolute -inset-1 border border-white/10 rounded-lg pointer-events-none" />
        
        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block bg-[#5c3a21] cursor-crosshair"
          />

          {/* Overlays */}
          {gameState.status === 'START' && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Star size={80} className="text-yellow-500 animate-spin-slow" />
                    <Trophy size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-200" />
                  </div>
                </div>
                <h1 className="text-7xl font-black text-yellow-500 mb-2 tracking-tighter italic">GOLD MINER</h1>
                <p className="text-zinc-500 mb-12 text-sm tracking-[0.3em] font-bold">DEEP EARTH EXPEDITION</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-8 text-xs text-zinc-400 mb-8">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-white">SPACE</kbd>
                      <span>SHOOT CLAW</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-white">↓</kbd>
                      <span>GRAB ITEM</span>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="group relative px-12 py-5 bg-yellow-500 text-black font-black text-2xl hover:bg-yellow-400 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    <span className="relative">START MINING</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {gameState.status === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <h2 className="text-7xl font-black text-white mb-4 tracking-tighter">GAME OVER</h2>
                <div className="bg-black/40 p-8 rounded-2xl border-2 border-white/10 mb-12">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">FINAL EARNINGS</p>
                  <p className="text-5xl font-bold text-yellow-500 mb-4">${gameState.score}</p>
                  <p className="text-zinc-500 text-[10px] uppercase">MISSED GOAL BY ${gameState.goal - gameState.score}</p>
                </div>
                <button
                  onClick={startGame}
                  className="px-12 py-5 bg-white text-black font-black text-2xl hover:bg-zinc-200 transition-all"
                >
                  RETRY MISSION
                </button>
              </motion.div>
            </div>
          )}

          {gameState.status === 'LEVEL_CLEAR' && (
            <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <div className="flex justify-center mb-6">
                  <Star size={64} className="text-emerald-400 animate-bounce" />
                </div>
                <h2 className="text-6xl font-black text-white mb-2 tracking-tighter">LEVEL {gameState.level} COMPLETE</h2>
                <p className="text-emerald-400 text-sm tracking-widest mb-12 uppercase">QUOTA ACHIEVED</p>
                <div className="bg-black/40 p-8 rounded-2xl border-2 border-emerald-500/20 mb-12">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">CURRENT BALANCE</p>
                  <p className="text-5xl font-bold text-emerald-400">${gameState.score}</p>
                </div>
                <button
                  onClick={nextLevel}
                  className="px-12 py-5 bg-emerald-500 text-black font-black text-2xl hover:bg-emerald-400 transition-all"
                >
                  NEXT SECTOR
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GoldMiner;
