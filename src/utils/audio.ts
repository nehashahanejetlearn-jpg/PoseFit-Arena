/**
 * Sci-Fi Web Audio Synthesizer for PoseFit Arena
 * Procedural futuristic sound effects without external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.value = 0.35;
        this.masterGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = muted ? 0 : 0.35;
    }
  }

  public setVolume(volume: number) { // 0.0 to 1.0
    if (this.masterGainNode && !this.isMuted) {
      this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume * 0.5));
    }
  }

  /**
   * UI Click - sharp cyber blip
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGainNode);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio fallback fail-safe
    }
  }

  /**
   * Countdown beep for 3, 2, 1
   */
  public playCountdown(isGo: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGo ? 'triangle' : 'sine';
      const freq = isGo ? 987.77 : 587.33; // B5 for GO, D5 for countdown
      osc.frequency.setValueAtTime(freq, now);

      if (isGo) {
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6
      }

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGainNode);

      osc.start(now);
      osc.stop(now + (isGo ? 0.36 : 0.16));
    } catch {
      // ignore
    }
  }

  /**
   * Valid Rep Completed - cyber laser chime with combo pitch scaling
   */
  public playRepSuccess(combo: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 523.25; // C5
      const pitchMultiplier = 1 + Math.min(combo * 0.08, 0.8);

      // Main chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq * pitchMultiplier, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 * pitchMultiplier, now + 0.18);

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      // Harmonic sparkle
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2 * pitchMultiplier, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3 * pitchMultiplier, now + 0.22);

      gain2.gain.setValueAtTime(0.15, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain1);
      gain1.connect(this.masterGainNode);
      osc2.connect(gain2);
      gain2.connect(this.masterGainNode);

      osc1.start(now);
      osc1.stop(now + 0.23);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.26);
    } catch {
      // ignore
    }
  }

  /**
   * Form Warning / Incomplete Rep - low pulse warning
   */
  public playFormWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGainNode);

      osc.start(now);
      osc.stop(now + 0.21);
    } catch {
      // ignore
    }
  }

  /**
   * Workout Complete Fanfare - celebratory futuristic chord
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGainNode);

        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Level Up / Major Achievement sound
   */
  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGainNode);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // ignore
    }
  }

  /**
   * Ambient Sci-Fi Space Hum (low rumble + subtle harmonic drone)
   */
  public toggleAmbientHum(enable: boolean) {
    if (!enable || this.isMuted) {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      return;
    }

    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    if (!this.ambientOsc) {
      try {
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientGain = this.ctx.createGain();

        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1 space hum

        this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.ambientGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.0);

        this.ambientOsc.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGainNode);

        this.ambientOsc.start();
      } catch {
        // ignore
      }
    } else if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.5);
    }
  }
}

export const sound = new SoundEngine();
