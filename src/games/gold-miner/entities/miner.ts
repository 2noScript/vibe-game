import { BaseEntity } from './base-entity';
import { ORIGIN_X, ORIGIN_Y, SWING_SPEED, MAX_ANGLE, CLAW_SPEED } from '../constants';
import { BaseItem } from './item';
import { InputManager } from '../core/input';
import { audio } from '../audio';

export class Miner extends BaseEntity {
  public angle: number = 0;
  public angleDir: number = 1;
  public clawState: 'swinging' | 'shooting' | 'retracting' = 'swinging';
  public clawLength: number = 60;
  public grabbedItem: BaseItem | null = null;
  public minerFrame: number = 0;

  private input: InputManager;

  constructor(input: InputManager) {
    super();
    this.input = input;
  }

  public init(): void {
    this.angle = 0;
    this.angleDir = 1;
    this.clawState = 'swinging';
    this.clawLength = 60;
    this.grabbedItem = null;
    this.minerFrame = 0;
  }

  public load(): void {}

  public update(dt: number): void {
    if (this.clawState === 'swinging') {
      this.angle += SWING_SPEED * this.angleDir;
      if (this.angle > MAX_ANGLE) {
        this.angle = MAX_ANGLE;
        this.angleDir = -1;
      } else if (this.angle < -MAX_ANGLE) {
        this.angle = -MAX_ANGLE;
        this.angleDir = 1;
      }

      if (this.input.isActionPressed()) {
        this.shoot();
      }
    } else if (this.clawState === 'shooting') {
      this.clawLength += CLAW_SPEED;
    } else if (this.clawState === 'retracting') {
      const speed = this.grabbedItem ? CLAW_SPEED * this.grabbedItem.weight : CLAW_SPEED;
      this.clawLength -= speed;
      this.minerFrame += 0.2;

      if (this.clawLength <= 60) {
        this.clawLength = 60;
        this.clawState = 'swinging';
      }
    }
  }

  public shoot() {
    if (this.clawState === 'swinging') {
      this.clawState = 'shooting';
      audio.playShoot();
    }
  }

  public isFinishedRetracting(): boolean {
    return this.clawState === 'swinging' && this.clawLength <= 60;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const isPulling = this.clawState === 'retracting' && this.grabbedItem;
    const pullWeight = this.grabbedItem ? this.grabbedItem.weight : 1;
    const isHeavy = isPulling && pullWeight < 0.5;

    // Draw Minecart
    ctx.save();
    ctx.translate(ORIGIN_X, ORIGIN_Y - 25);
    
    ctx.fillStyle = '#4a2c1a'; // Wood color
    ctx.beginPath();
    // @ts-ignore
    if (ctx.roundRect) ctx.roundRect(-40, 0, 80, 30, 4);
    else ctx.rect(-40, 0, 80, 30);
    ctx.fill();
    
    // Wood texture
    ctx.strokeStyle = '#2c1a0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-40, 10); ctx.lineTo(40, 10);
    ctx.moveTo(-40, 20); ctx.lineTo(40, 20);
    ctx.stroke();

    // Metallic rim
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.strokeRect(-40, 0, 80, 30);
    
    // Rivets
    ctx.fillStyle = '#333';
    for (let x = -35; x <= 35; x += 10) {
      ctx.beginPath(); ctx.arc(x, 3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 27, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // Wheels
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-25, 30, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(25, 30, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-25, 30, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(25, 30, 8, 0, Math.PI * 2); ctx.stroke();
    // Spokes
    ctx.beginPath();
    ctx.moveTo(-25, 22); ctx.lineTo(-25, 38);
    ctx.moveTo(-33, 30); ctx.lineTo(-17, 30);
    ctx.moveTo(25, 22); ctx.lineTo(25, 38);
    ctx.moveTo(17, 30); ctx.lineTo(33, 30);
    ctx.stroke();

    // Miner Body
    const leanAngle = isPulling ? Math.sin(this.minerFrame) * 0.15 - 0.15 : 0;
    ctx.rotate(leanAngle);
    
    // Shirt
    const shirtGrad = ctx.createLinearGradient(-15, -35, 15, -35);
    shirtGrad.addColorStop(0, isHeavy ? '#ff4444' : '#cc0000');
    shirtGrad.addColorStop(1, isHeavy ? '#aa0000' : '#880000');
    ctx.fillStyle = shirtGrad;
    ctx.beginPath();
    // @ts-ignore
    if (ctx.roundRect) ctx.roundRect(-15, -35, 30, 35, 5);
    else ctx.rect(-15, -35, 30, 35);
    ctx.fill();
    
    // Overalls
    ctx.fillStyle = '#0044cc';
    ctx.fillRect(-15, -15, 30, 15);
    ctx.fillRect(-15, -35, 8, 20);
    ctx.fillRect(7, -35, 8, 20);
    
    // Buttons
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(-11, -18, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -18, 2, 0, Math.PI * 2); ctx.fill();

    // Belt
    ctx.fillStyle = '#333';
    ctx.fillRect(-15, -16, 30, 4);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-3, -17, 6, 6);

    // Head
    ctx.save();
    ctx.translate(0, -42);
    
    ctx.fillStyle = isHeavy ? '#ff9999' : '#ffdbac';
    ctx.beginPath(); ctx.arc(-12, -2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -2, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = isHeavy ? '#ff9999' : '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(0, 20, 11, 2);
    ctx.lineTo(11, -2);
    ctx.lineTo(-11, -2);
    ctx.fill();
    
    ctx.fillStyle = isHeavy ? '#ff6666' : '#ffad60';
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    if (isPulling) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -5); ctx.lineTo(-3, -3);
      ctx.moveTo(7, -5); ctx.lineTo(3, -3);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(-5, -5, 2, 0, Math.PI * 2);
      ctx.arc(5, -5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(0, -11, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, -13, 11, Math.PI, 0);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.fillRect(-4, -22, 8, 8);
    const lampGrad = ctx.createRadialGradient(0, -18, 0, 0, -18, 15);
    lampGrad.addColorStop(0, '#ffff00');
    lampGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(0, -18, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -18, 3, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();
    
    ctx.strokeStyle = isHeavy ? '#ff9999' : '#ffdbac';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    const armY = -25 + (isPulling ? Math.sin(this.minerFrame) * 4 : 0);
    ctx.beginPath(); ctx.moveTo(-15, -25); ctx.lineTo(-5, armY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -25); ctx.lineTo(5, armY); ctx.stroke();
    ctx.fillStyle = isHeavy ? '#ff9999' : '#ffdbac';
    ctx.beginPath(); ctx.arc(-5, armY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, armY, 4, 0, Math.PI * 2); ctx.fill();
    
    ctx.restore();

    // Draw Rope and Claw
    this.drawClaw(ctx);
  }

  private drawClaw(ctx: CanvasRenderingContext2D) {
    const clawX = ORIGIN_X + Math.sin(this.angle) * this.clawLength;
    const clawY = ORIGIN_Y + Math.cos(this.angle) * this.clawLength;

    let ropeX = clawX;
    if (this.clawState === 'retracting' && this.grabbedItem) {
      ropeX += Math.sin(Date.now() * 0.1) * 2;
    }

    // Rope
    ctx.beginPath();
    ctx.moveTo(ORIGIN_X, ORIGIN_Y);
    ctx.lineTo(ropeX, clawY);
    ctx.strokeStyle = '#4a2c1a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#6b4423';
    ctx.stroke();
    ctx.setLineDash([]);

    // Claw
    ctx.save();
    ctx.translate(ropeX, clawY);
    ctx.rotate(-this.angle);
    
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI, true);
    ctx.fill();
    
    const armAngle = (this.clawState === 'retracting' || this.grabbedItem) ? 0.3 : 0.8;
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-18 * Math.sin(armAngle), 20 * Math.cos(armAngle));
    ctx.lineTo(-12 * Math.sin(armAngle), 25 * Math.cos(armAngle));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(18 * Math.sin(armAngle), 20 * Math.cos(armAngle));
    ctx.lineTo(12 * Math.sin(armAngle), 25 * Math.cos(armAngle));
    ctx.stroke();
    
    ctx.restore();

    // Grabbed Item
    if (this.grabbedItem) {
      const item = this.grabbedItem;
      ctx.save();
      ctx.translate(ropeX, clawY + item.radius - 5);
      ctx.rotate(item.rotation);
      
      const originalX = item.x;
      const originalY = item.y;
      item.x = 0;
      item.y = 0;
      item.draw(ctx);
      item.x = originalX;
      item.y = originalY;
      
      ctx.restore();
    }
  }

  public destroy(): void {}
}
