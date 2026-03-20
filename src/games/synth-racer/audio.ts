class SynthAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private musicNodes: AudioNode[] = [];

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startEngine() {
    if (!this.ctx || !this.masterGain) return;
    this.init();

    if (this.engineOsc) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 100;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineGain.gain.value = 0.1;
    this.engineOsc.start();
  }

  updateEngine(speed: number) {
    if (!this.engineOsc || !this.ctx) return;
    // Speed 0-60 -> Pitch 100-300
    const pitch = 100 + (speed / 60) * 200;
    this.engineOsc.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (this.engineOsc) {
      this.engineOsc.stop();
      this.engineOsc.disconnect();
      this.engineOsc = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
  }

  playCrash() {
    if (!this.ctx || !this.masterGain) return;
    this.stopEngine();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const noiseBuffer = this.createNoiseBuffer();
    const noise = this.ctx.createBufferSource();

    noise.buffer = noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 1);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 1);
  }

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playMusic() {
    // Simple bassline loop
    if (!this.ctx || !this.masterGain) return;
    this.stopMusic();

    const tempo = 120;
    const beatTime = 60 / tempo;
    
    // Bass sequence (E2, E2, G2, A2)
    const notes = [82.41, 82.41, 98.00, 110.00];
    
    const playNote = (freq: number, time: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
      
      // Filter sweep
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, time);
      filter.frequency.linearRampToValueAtTime(800, time + 0.1);
      filter.frequency.linearRampToValueAtTime(200, time + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(time);
      osc.stop(time + 0.5);
      
      this.musicNodes.push(osc, gain, filter);
    };

    const startTime = this.ctx.currentTime + 0.1;
    for (let i = 0; i < 16; i++) { // 4 bars
      const note = notes[i % 4];
      playNote(note, startTime + i * beatTime);
    }
    
    // Loop it manually or with AudioWorklet (simplified here: just play once for demo or loop with setInterval in component)
  }

  stopMusic() {
    this.musicNodes.forEach(node => node.disconnect());
    this.musicNodes = [];
  }
}

export const audio = new SynthAudioManager();
