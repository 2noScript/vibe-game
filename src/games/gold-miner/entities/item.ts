import { BaseEntity } from './base-entity';
import { ItemType } from '../types';

export abstract class BaseItem extends BaseEntity {
  constructor(
    public id: number,
    public type: ItemType,
    public x: number,
    public y: number,
    public radius: number,
    public value: number,
    public weight: number,
    public color: string,
    public rotation: number,
    public points: { x: number; y: number }[]
  ) {
    super();
  }

  public init(): void {}
  public load(): void {}
  public update(dt: number): void {}
  public destroy(): void {}

  abstract draw(ctx: CanvasRenderingContext2D): void;

  protected drawIrregular(ctx: CanvasRenderingContext2D, highlightColor: string) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    
    const grad = ctx.createRadialGradient(-this.radius/3, -this.radius/3, 0, 0, 0, this.radius);
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(1, this.color);
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Highlights
    if (this.type.includes('gold')) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-this.radius/2, -this.radius/2, this.radius/4, this.radius/6, Math.PI/4, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

export class GoldItem extends BaseItem {
  draw(ctx: CanvasRenderingContext2D) {
    this.drawIrregular(ctx, '#FFF700');
  }
}

export class RockItem extends BaseItem {
  draw(ctx: CanvasRenderingContext2D) {
    this.drawIrregular(ctx, '#A9A9A9');
  }
}

export class DiamondItem extends BaseItem {
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius, 0);
    ctx.closePath();
    
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#00ffff');
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

export class MysteryItem extends BaseItem {
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#9370DB';
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Question mark
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 0);
    
    ctx.restore();
  }
}
