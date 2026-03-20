import { GameState } from '../types';
import { Player } from '../entities/player';
import { Enemy } from '../entities/enemy';
import { Bullet } from '../entities/bullet';
import { ParticleSystem } from '../systems/particles';
import { InputManager } from './input';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LEVEL_LENGTH, PLATFORMS, checkCollision } from '../constants';
import { audio } from '../audio';

export class ContraEngine {
  public gameState: GameState;
  public player: Player;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public particles: ParticleSystem;
  public input: InputManager;
  
  public cameraX: number = 0;
  public lastSpawnX: number = 0;
  public bulletIdCounter = { current: 0 };
  public enemyIdCounter = { current: 0 };

  private onScore: (val: number) => void;
  private onStateChange: (status: GameState['status']) => void;
  private onLifeLost: () => void;

  constructor(
    initialState: GameState,
    onScore: (val: number) => void,
    onStateChange: (status: GameState['status']) => void,
    onLifeLost: () => void
  ) {
    this.gameState = initialState;
    this.onScore = onScore;
    this.onStateChange = onStateChange;
    this.onLifeLost = onLifeLost;

    this.player = new Player(100, 400);
    this.particles = new ParticleSystem();
    this.input = new InputManager();
  }

  public init() {
    this.input.init();
  }

  public destroy() {
    this.input.destroy();
  }

  public update(dt: number) {
    if (this.gameState.status !== 'PLAYING') return;

    // Player
    this.player.update(dt, this.input, this.bullets, this.bulletIdCounter, this.cameraX);

    // Camera follow
    if (this.player.x > this.cameraX + CANVAS_WIDTH / 2) {
      this.cameraX = this.player.x - CANVAS_WIDTH / 2;
    }

    // Check player death
    if (this.player.hp <= 0 && this.player.state !== 'dead') {
      this.player.state = 'dead';
      this.particles.spawnExplosion(this.player.x + this.player.w/2, this.player.y + this.player.h/2, '#3b82f6');
      audio.playPlayerHit();
      
      setTimeout(() => {
        if (this.gameState.lives > 1) {
          this.onLifeLost();
          this.player = new Player(this.cameraX + 100, 100);
          this.player.state = 'fall';
          this.player.invincible = 120;
        } else {
          this.onStateChange('GAME_OVER');
          audio.playGameOver();
        }
      }, 1000);
    }

    // Win condition
    if (this.player.x >= LEVEL_LENGTH && this.gameState.status === 'PLAYING') {
      this.gameState.status = 'WIN'; // Optimistic update to prevent multiple triggers
      this.onStateChange('WIN');
      audio.playWin();
    }

    // Spawner
    if (this.cameraX > this.lastSpawnX + 400 && this.player.x < LEVEL_LENGTH - 400) {
      this.lastSpawnX = this.cameraX;
      if (Math.random() > 0.3) {
        this.enemies.push(new Enemy(
          this.enemyIdCounter.current++,
          this.cameraX + CANVAS_WIDTH + 50,
          100
        ));
      }
    }

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player, this.bullets, this.bulletIdCounter, this.cameraX);

      if (enemy.y > CANVAS_HEIGHT + 100 || enemy.x < this.cameraX - 200) {
        this.enemies.splice(i, 1);
      }
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.active) {
        this.bullets.splice(i, 1);
        continue;
      }

      b.update(dt);

      if (b.x < this.cameraX || b.x > this.cameraX + CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
        b.active = false;
        continue;
      }

      if (b.isEnemy) {
        if (this.player.state !== 'dead' && this.player.invincible <= 0) {
          if (checkCollision({x: b.x-4, y: b.y-4, w: 8, h: 8}, this.player)) {
            this.player.hp -= 1;
            b.active = false;
          }
        }
      } else {
        for (const enemy of this.enemies) {
          if (enemy.state !== 'dead') {
            if (checkCollision({x: b.x-4, y: b.y-4, w: 8, h: 8}, enemy)) {
              enemy.hp -= 1;
              b.active = false;
              if (enemy.hp <= 0) {
                enemy.state = 'dead';
                this.particles.spawnExplosion(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#ef4444');
                this.onScore(100);
              }
            }
          }
        }
      }
    }

    // Cleanup dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].state === 'dead') this.enemies.splice(i, 1);
    }

    // Player body collision with enemies
    if (this.player.state !== 'dead' && this.player.invincible <= 0) {
      for (const enemy of this.enemies) {
        if (checkCollision(this.player, enemy)) {
          this.player.hp -= 1;
        }
      }
    }

    // Particles
    this.particles.update(dt);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 20; i++) {
      const bx = ((i * 300) - (this.cameraX * 0.3)) % (LEVEL_LENGTH + 1000);
      ctx.beginPath();
      ctx.moveTo(bx, CANVAS_HEIGHT);
      ctx.lineTo(bx + 150, CANVAS_HEIGHT - 300);
      ctx.lineTo(bx + 300, CANVAS_HEIGHT);
      ctx.fill();
    }

    ctx.fillStyle = '#166534';
    for (const plat of PLATFORMS) {
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(plat.x, plat.y, plat.w, 8);
      ctx.fillStyle = '#166534';
    }

    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }

    this.player.draw(ctx);

    for (const b of this.bullets) {
      b.draw(ctx);
    }

    this.particles.draw(ctx);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(LEVEL_LENGTH, 0, 50, CANVAS_HEIGHT);

    ctx.restore();
  }
}
