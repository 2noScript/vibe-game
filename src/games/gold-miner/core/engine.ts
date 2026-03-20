import { BaseEngine } from './base-engine';
import { ItemType, GameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, ITEM_DEFS, ORIGIN_X, ORIGIN_Y } from '../constants';
import { BaseItem, GoldItem, RockItem, DiamondItem, MysteryItem } from '../entities/item';
import { Miner } from '../entities/miner';
import { ParticleSystem } from '../systems/particles';
import { audio } from '../audio';
import { InputManager } from './input';

export class GoldMinerEngine extends BaseEngine {
  public miner: Miner;
  public items: BaseItem[] = [];
  public particleSystem: ParticleSystem;
  public screenShake: number = 0;
  public gameState: GameState;
  private input: InputManager;

  private onScore: (val: number) => void;
  private onStateChange: (status: GameState['status']) => void;

  constructor(
    gameState: GameState, 
    onScore: (val: number) => void, 
    onStateChange: (status: GameState['status']) => void
  ) {
    super();
    this.gameState = gameState;
    this.onScore = onScore;
    this.onStateChange = onStateChange;
    
    this.input = new InputManager();
    this.miner = new Miner(this.input);
    this.particleSystem = new ParticleSystem();

    this.entities.push(this.miner);
  }

  public generateLevel(level: number) {
    this.items = [];
    let idCounter = 0;

    const generateIrregularPoints = (radius: number, pointsCount: number = 8) => {
      const points = [];
      for (let i = 0; i < pointsCount; i++) {
        const angle = (i / pointsCount) * Math.PI * 2;
        const r = radius * (0.8 + Math.random() * 0.4);
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      return points;
    };

    const addItem = (type: ItemType, count: number) => {
      for (let i = 0; i < count; i++) {
        const def = ITEM_DEFS[type];
        const x = Math.random() * (CANVAS_WIDTH - 120) + 60;
        const y = Math.random() * (CANVAS_HEIGHT - 250) + 180;
        const rotation = Math.random() * Math.PI * 2;
        const points = generateIrregularPoints(def.radius, type.includes('gold') ? 10 : 6);

        let item: BaseItem;
        if (type.includes('gold')) item = new GoldItem(idCounter++, type, x, y, def.radius, def.value, def.weight, def.color, rotation, points);
        else if (type.includes('rock')) item = new RockItem(idCounter++, type, x, y, def.radius, def.value, def.weight, def.color, rotation, points);
        else if (type === 'diamond') item = new DiamondItem(idCounter++, type, x, y, def.radius, def.value, def.weight, def.color, rotation, points);
        else item = new MysteryItem(idCounter++, type, x, y, def.radius, def.value, def.weight, def.color, rotation, points);
        
        this.items.push(item);
      }
    };

    addItem('gold_large', 1 + Math.floor(level / 2));
    addItem('gold_medium', 2 + Math.floor(level / 2));
    addItem('gold_small', 3 + level);
    addItem('rock_large', 1 + level);
    addItem('rock_small', 2 + level);
    if (level > 1) addItem('diamond', Math.floor(level / 2));
    if (level > 2) addItem('mystery', 1);
  }

  public update(dt: number) {
    if (this.gameState.status !== 'PLAYING') return;

    this.particleSystem.update(dt);

    if (this.screenShake > 0) this.screenShake -= 0.5;

    this.miner.update(dt);

    if (this.miner.clawState === 'shooting') {
      const clawX = ORIGIN_X + Math.sin(this.miner.angle) * this.miner.clawLength;
      const clawY = ORIGIN_Y + Math.cos(this.miner.angle) * this.miner.clawLength;

      if (clawX < 0 || clawX > CANVAS_WIDTH || clawY > CANVAS_HEIGHT) {
        this.miner.clawState = 'retracting';
      }

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const dist = Math.hypot(clawX - item.x, clawY - item.y);
        if (dist < item.radius + 15) {
          this.miner.grabbedItem = item;
          this.items.splice(i, 1);
          this.miner.clawState = 'retracting';
          
          if (item.type === 'mystery') {
            const values = [1, 50, 100, 500, 800];
            item.value = values[Math.floor(Math.random() * values.length)];
          }

          this.createGrabEffects(item);
          audio.startReel(item.weight);
          break;
        }
      }
    } else if (this.miner.isFinishedRetracting()) {
      audio.stopReel();
      if (this.miner.grabbedItem) {
        const itemValue = this.miner.grabbedItem.value;
        this.onScore(itemValue);
        this.particleSystem.addFloatingText(ORIGIN_X, ORIGIN_Y - 40, `+$${itemValue}`, itemValue > 100 ? '#4ade80' : '#fff');
        this.miner.grabbedItem = null;
        audio.playScore();
      }

      if (this.items.length === 0 && this.miner.grabbedItem === null) {
        if (this.gameState.score >= this.gameState.goal) {
          audio.playLevelClear();
          this.onStateChange('LEVEL_CLEAR');
        } else {
          audio.playGameOver();
          this.onStateChange('GAME_OVER');
        }
      }
    }
  }

  private createGrabEffects(item: BaseItem) {
    if (item.type.includes('gold')) {
      audio.playGrabGold();
      this.particleSystem.addParticles(item.x, item.y, '#FFD700', 15);
    } else if (item.type.includes('rock')) {
      audio.playGrabRock();
      this.particleSystem.addParticles(item.x, item.y, '#8B7D7B', 10);
      this.screenShake = 5;
    } else if (item.type === 'diamond') {
      audio.playGrabDiamond();
      this.particleSystem.addParticles(item.x, item.y, '#E0FFFF', 20);
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    // Background
    const bgGradient = ctx.createLinearGradient(0, 70, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#5c3a21');
    bgGradient.addColorStop(1, '#2c1a0b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 70, CANVAS_WIDTH, CANVAS_HEIGHT - 70);

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 70);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 10);

    // Items
    for (const item of this.items) item.draw(ctx);

    // Miner & Claw
    this.miner.draw(ctx);

    // Particles
    this.particleSystem.draw(ctx);

    ctx.restore();
  }

  public destroy() {
    super.destroy();
    this.input.destroy();
  }
}
