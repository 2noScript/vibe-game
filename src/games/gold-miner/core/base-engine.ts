import { BaseEntity } from '../entities/base-entity';

export abstract class BaseEngine {
  protected entities: BaseEntity[] = [];
  protected lastTime: number = 0;
  protected animationFrameId: number | null = null;

  public abstract update(dt: number): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;
  
  public start(ctx: CanvasRenderingContext2D) {
    this.lastTime = performance.now();
    this.loop(ctx);
  }

  protected loop = (ctx: CanvasRenderingContext2D) => {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Fixed time step (optional, but good for physics)
    // Here we just pass dt directly for simplicity, but cap it to avoid huge jumps
    const cappedDt = Math.min(dt, 0.1);

    this.update(cappedDt);
    this.draw(ctx);

    this.animationFrameId = requestAnimationFrame(() => this.loop(ctx));
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.stop();
    this.entities.forEach(e => e.destroy());
    this.entities = [];
  }
}
