// Audio manager using Web Audio API for sound generation
class AudioManagerClass {
  private audioContext: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicPlaying = false;

  init() {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.3;
    this.musicGain.connect(this.audioContext.destination);
    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.audioContext.destination);
  }

  private ensureContext() {
    if (!this.audioContext) this.init();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setMusicVolume(v: number) {
    if (this.musicGain) this.musicGain.gain.value = v * 0.4;
  }

  setSfxVolume(v: number) {
    if (this.sfxGain) this.sfxGain.gain.value = v * 0.6;
  }

  playClick() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playJump() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playSlide() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playCollision() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    // Noise burst for collision
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    source.connect(gain);
    gain.connect(this.sfxGain);
    source.start();
  }

  playCountdown() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playGo() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(1047, this.audioContext.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.4);
  }

  playGameOver() {
    this.ensureContext();
    if (!this.audioContext || !this.sfxGain) return;
    const notes = [440, 392, 349, 294];
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.3, this.audioContext!.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + i * 0.2 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(this.audioContext!.currentTime + i * 0.2);
      osc.stop(this.audioContext!.currentTime + i * 0.2 + 0.3);
    });
  }

  startMusic() {
    if (this.musicPlaying) return;
    this.ensureContext();
    if (!this.audioContext || !this.musicGain) return;
    this.musicPlaying = true;
    // Simple ambient music loop
    this.playMusicLoop();
  }

  private playMusicLoop() {
    if (!this.musicPlaying || !this.audioContext || !this.musicGain) return;
    const notes = [130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63];
    const now = this.audioContext.currentTime;
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.5);
      gain.gain.setValueAtTime(0.08, now + i * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 0.45);
      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(now + i * 0.5);
      osc.stop(now + i * 0.5 + 0.45);
      this.musicOscillators.push(osc);
    });
    // Loop after all notes
    setTimeout(() => this.playMusicLoop(), notes.length * 500);
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    this.musicOscillators = [];
  }
}

export const AudioManager = new AudioManagerClass();
