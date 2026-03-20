import { BaseEntity } from '../entities/base-entity';

export class Particle extends BaseEntity {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public life: number,
    public maxLife: number,
    public color: string,
    public size: number
  ) {
    super();
  }

  public init(): void {}
  public load(): void {}

  public update(dt: number): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.life -= 0.02;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  public isDead(): boolean {
    return this.life <= 0;
  }

  public destroy(): void {}
}

export class FloatingText extends BaseEntity {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public text: string,
    public life: number,
    public color: string
  ) {
    super();
  }

  public init(): void {}
  public load(): void {}

  public update(dt: number): void {
    this.y -= 1;
    this.life -= 0.02;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.restore();
  }

  public isDead(): boolean {
    return this.life <= 0;
  }

  public destroy(): void {}
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  public addParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        Math.random(), x, y,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        1, 0.5 + Math.random() * 0.5,
        color, 2 + Math.random() * 3
      ));
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push(new FloatingText(Math.random(), x, y, text, 1, color));
  }

  public update(dt: number) {
    this.particles.forEach(p => p.update(dt));
    this.floatingTexts.forEach(t => t.update(dt));

    this.particles = this.particles.filter(p => !p.isDead());
    this.floatingTexts = this.floatingTexts.filter(t => !t.isDead());
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => p.draw(ctx));
    this.floatingTexts.forEach(t => t.draw(ctx));
  }
}
