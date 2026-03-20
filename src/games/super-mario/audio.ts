class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2;
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
    this.playTone(400, 'sine', 0.15, 0.4, 800);
  }

  playCoin() {
    this.playTone(987.77, 'sine', 0.1, 0.3); // B5
    setTimeout(() => this.playTone(1318.51, 'sine', 0.2, 0.3), 100); // E6
  }

  playStomp() {
    this.playTone(200, 'square', 0.1, 0.5, 50);
  }

  playPowerUp() {
    this.playTone(440, 'sine', 0.1, 0.3);
    setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.3), 100);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.3), 200);
    setTimeout(() => this.playTone(880, 'sine', 0.2, 0.4), 300);
  }

  playHit() {
    this.playTone(150, 'sawtooth', 0.3, 0.6, 40);
  }

  playLevelClear() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.3), i * 200);
    });
  }

  playGameOver() {
    this.playTone(392, 'sawtooth', 0.5, 0.5, 100);
  }
}

export const audio = new AudioManager();
