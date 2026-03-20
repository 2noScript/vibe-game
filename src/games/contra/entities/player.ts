import { BaseEntity } from './base-entity';
import { GRAVITY, JUMP_FORCE, SPEED, BULLET_SPEED, PLATFORMS, CANVAS_HEIGHT } from '../constants';
import { InputManager } from '../core/input';
import { Bullet } from './bullet';
import { audio } from '../audio';

export class Player extends BaseEntity {
  public state: 'idle' | 'run' | 'jump' | 'fall' | 'duck' | 'dead' = 'idle';
  public facing: 1 | -1 = 1;
  public aimAngle: number = 0;
  public shootCooldown: number = 0;
  public invincible: number = 60;
  public hp: number = 1;

  constructor(x: number, y: number) {
    super(x, y, 30, 60);
  }

  public update(dt: number, input: InputManager, bullets: Bullet[], bulletIdCounter: { current: number }, cameraX: number) {
    if (this.state === 'dead') return;

    if (this.invincible > 0) this.invincible--;
    if (this.shootCooldown > 0) this.shootCooldown--;

    const keys = input.keys;

    this.vx = 0;
    if (keys.left && !keys.down) { this.vx = -SPEED; this.facing = -1; }
    if (keys.right && !keys.down) { this.vx = SPEED; this.facing = 1; }

    if (keys.up) {
      if (keys.left) this.aimAngle = -135;
      else if (keys.right) this.aimAngle = -45;
      else this.aimAngle = -90;
    } else if (keys.down) {
      if (this.state === 'jump' || this.state === 'fall') {
        if (keys.left) this.aimAngle = 135;
        else if (keys.right) this.aimAngle = 45;
        else this.aimAngle = 90;
      } else {
        this.aimAngle = this.facing === 1 ? 0 : 180;
      }
    } else {
      this.aimAngle = this.facing === 1 ? 0 : 180;
    }

    if (this.vy === 0) {
      if (keys.down) {
        this.state = 'duck';
        this.h = 30;
        this.y += 30; // visual adjustment handled in draw, but logical collision needs it
      } else {
        this.h = 60;
        if (this.vx !== 0) this.state = 'run';
        else this.state = 'idle';
      }

      if (keys.z && this.state !== 'duck') {
        this.vy = JUMP_FORCE;
        this.state = 'jump';
        audio.playJump();
        keys.z = false;
      }
    } else {
      this.h = 40;
      if (this.vy > 0) this.state = 'fall';
      else this.state = 'jump';
    }

    if (keys.x && this.shootCooldown <= 0) {
      const rad = (this.aimAngle * Math.PI) / 180;
      let bx = this.x + this.w / 2;
      let by = this.y + (this.state === 'duck' ? 15 : 20);
      
      bullets.push(new Bullet(
        bulletIdCounter.current++,
        bx, by,
        Math.cos(rad) * BULLET_SPEED,
        Math.sin(rad) * BULLET_SPEED,
        false
      ));
      this.shootCooldown = 8;
      audio.playShoot();
    }

    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    let onGround = false;
    for (const plat of PLATFORMS) {
      if (this.vy > 0 && this.y - this.vy + this.h <= plat.y) {
        if (this.x + this.w > plat.x && this.x < plat.x + plat.w) {
          if (keys.down && keys.z && plat.h <= 20) {
            // Drop through
          } else {
            this.y = plat.y - this.h;
            this.vy = 0;
            onGround = true;
          }
        }
      }
    }

    if (this.y > CANVAS_HEIGHT + 100) {
      this.hp = 0;
    }

    if (this.x < cameraX) this.x = cameraX;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.state === 'dead') return;

    if (this.invincible <= 0 || Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.fillStyle = '#3b82f6';
      
      const drawY = this.y;
      
      if (this.state === 'jump' || this.state === 'fall') {
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(this.x + 5, this.y + 15, 20, 10);
      } else {
        ctx.fillRect(this.x, drawY, this.w, this.h);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(this.x - 2, drawY + 5, this.w + 4, 8);
        
        ctx.fillStyle = '#94a3b8';
        ctx.save();
        ctx.translate(this.x + this.w/2, drawY + 20);
        ctx.rotate((this.aimAngle * Math.PI) / 180);
        ctx.fillRect(0, -4, 25, 8);
        ctx.restore();
      }
    }
  }
}
