/**
 * Audio assets for Zombie Plant game.
 */

const createAudio = (frequency: number, type: OscillatorType = 'square', duration: number = 0.1) => {
  return () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  };
};

export const playShootSound = createAudio(440, 'square', 0.1);
export const playHitSound = createAudio(220, 'sawtooth', 0.15);
export const playDeathSound = createAudio(110, 'sine', 0.3);
export const playPlantSound = createAudio(880, 'triangle', 0.05);
