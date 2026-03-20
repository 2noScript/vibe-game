import { BaseEntity } from './base-entity';

export class Bullet extends BaseEntity {
  public id: number;
  public isEnemy: boolean;
  public active: boolean = true;

  constructor(id: number, x: number, y: number, vx: number, vy: number, isEnemy: boolean) {
    super(x, y, 8, 8); // logical size for collision
    this.id = id;
    this.vx = vx;
    this.vy = vy;
    this.isEnemy = isEnemy;
  }

  public update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isEnemy ? '#ef4444' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
