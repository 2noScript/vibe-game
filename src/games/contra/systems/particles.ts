import { audio } from '../audio';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticleSystem {
  public particles: Particle[] = [];

  public spawnExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 20 + Math.random() * 10,
        maxLife: 30,
        color
      });
    }
    audio.playExplosion();
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }
}
