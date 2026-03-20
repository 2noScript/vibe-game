import { Rect } from '../types';

export abstract class BaseEntity implements Rect {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public vx: number = 0;
  public vy: number = 0;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  public abstract update(dt: number, ...args: any[]): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;
}
