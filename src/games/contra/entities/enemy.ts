import { BaseEntity } from './base-entity';
import { GRAVITY, BULLET_SPEED, PLATFORMS, CANVAS_HEIGHT } from '../constants';
import { Bullet } from './bullet';
import { Player } from './player';
import { audio } from '../audio';

export class Enemy extends BaseEntity {
  public id: number;
  public hp: number = 1;
  public state: 'run' | 'dead' = 'run';
  public facing: 1 | -1 = -1;
  public shootCooldown: number = 60;

  constructor(id: number, x: number, y: number) {
    super(x, y, 30, 60);
    this.id = id;
    this.vx = -2;
  }

  public update(dt: number, player: Player, bullets: Bullet[], bulletIdCounter: { current: number }, cameraX: number) {
    if (this.state === 'dead') return;

    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    for (const plat of PLATFORMS) {
      if (this.vy > 0 && this.y - this.vy + this.h <= plat.y) {
        if (this.x + this.w > plat.x && this.x < plat.x + plat.w) {
          this.y = plat.y - this.h;
          this.vy = 0;
        }
      }
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.shootCooldown <= 0 && Math.abs(this.x - player.x) < 600 && player.state !== 'dead') {
      const dx = (player.x + player.w/2) - (this.x + this.w/2);
      const dy = (player.y + player.h/2) - (this.y + this.h/2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      bullets.push(new Bullet(
        bulletIdCounter.current++,
        this.x + this.w/2, this.y + 20,
        (dx / dist) * (BULLET_SPEED * 0.5),
        (dy / dist) * (BULLET_SPEED * 0.5),
        true
      ));
      this.shootCooldown = 120 + Math.random() * 60;
      audio.playEnemyShoot();
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.state === 'dead') return;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + (this.facing === 1 ? 20 : 5), this.y + 10, 5, 5);
  }
}
