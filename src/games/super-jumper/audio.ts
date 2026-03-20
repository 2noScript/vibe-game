class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 1, slideTo?: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    this.playTone(400, 'triangle', 0.1, 0.4, 800);
  }

  playCoin() {
    this.playTone(800, 'square', 0.1, 0.3, 1200);
  }

  playPowerUp() {
    this.playTone(400, 'square', 0.3, 0.4, 1000);
  }

  playStomp() {
    this.playTone(200, 'sawtooth', 0.1, 0.5, 50);
  }

  playHit() {
    this.playTone(150, 'sawtooth', 0.2, 0.6, 40);
  }

  playGameOver() {
    this.playTone(200, 'sawtooth', 1.0, 0.5, 20);
  }

  playLevelClear() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [440, 554, 659, 880].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
}

export const audio = new AudioManager();
