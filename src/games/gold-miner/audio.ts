class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reelOsc: OscillatorNode | null = null;
  private reelGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playShoot() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playGrabGold() {
    this.playTone(800, 'sine', 0.1, 0.5);
    setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.5), 100);
  }

  playGrabRock() {
    this.playTone(150, 'square', 0.2, 0.5);
  }

  playGrabDiamond() {
    this.playTone(1200, 'sine', 0.1, 0.3);
    setTimeout(() => this.playTone(1600, 'sine', 0.1, 0.4), 100);
    setTimeout(() => this.playTone(2000, 'sine', 0.2, 0.5), 200);
  }

  playScore() {
    this.playTone(600, 'square', 0.1, 0.3);
    setTimeout(() => this.playTone(800, 'square', 0.2, 0.3), 100);
  }

  playLevelClear() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.4);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 1);
  }

  playGameOver() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 1);
  }

  startReel(weight: number) {
    if (!this.ctx || !this.masterGain) return;
    if (this.reelOsc) this.stopReel();

    this.reelOsc = this.ctx.createOscillator();
    this.reelGain = this.ctx.createGain();
    
    this.reelOsc.type = 'triangle';
    // Heavier weight = lower frequency
    const freq = 200 - (weight * 100);
    this.reelOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    this.reelGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    
    this.reelOsc.connect(this.reelGain);
    this.reelGain.connect(this.masterGain);
    
    this.reelOsc.start();
  }

  stopReel() {
    if (this.reelOsc && this.reelGain && this.ctx) {
      this.reelGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      this.reelOsc.stop(this.ctx.currentTime + 0.1);
      this.reelOsc = null;
      this.reelGain = null;
    }
  }
}

export const audio = new AudioManager();
