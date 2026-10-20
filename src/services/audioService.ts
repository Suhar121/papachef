/**
 * Audio Synthesis & Kitchen Intercom Service
 * Uses Web Audio API for zero-latency, 100% reliable sound effects without external audio file dependencies.
 * Also integrates browser SpeechSynthesis to verbally call the chef from the counter.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceEnabled: boolean = true;

  constructor() {
    // Lazily initialized on first user interaction
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Classic Brass Restaurant Counter Bell Ding (叮!)
   * Modeled with high fundamental and metallic decay overtones.
   */
  public playKitchenBell(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary chime frequency (1600 Hz - bright brass counter bell)
      const primaryOsc = ctx.createOscillator();
      const primaryGain = ctx.createGain();

      primaryOsc.type = 'sine';
      primaryOsc.frequency.setValueAtTime(1600, now);
      primaryOsc.frequency.exponentialRampToValueAtTime(1590, now + 1.2);

      primaryGain.gain.setValueAtTime(0.7, now);
      primaryGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      primaryOsc.connect(primaryGain);
      primaryGain.connect(ctx.destination);

      // Higher harmonic (3200 Hz brass overtone)
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(3220, now);

      overtoneGain.gain.setValueAtTime(0.3, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      // Metallic click strike at start (50ms noise burst)
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'square';
      strikeOsc.frequency.setValueAtTime(800, now);
      strikeGain.gain.setValueAtTime(0.2, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);

      primaryOsc.start(now);
      overtoneOsc.start(now);
      strikeOsc.start(now);

      primaryOsc.stop(now + 1.3);
      overtoneOsc.stop(now + 0.7);
      strikeOsc.stop(now + 0.06);
    } catch {
      // Audio fallback silent fail
    }
  }

  /**
   * Pleasant ascending two-tone chime when food is READY from kitchen (Ding-Dong!)
   */
  public playOrderReadyChime(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // First note (G5 - 784 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Second note (C6 - 1046 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046, now + 0.25);
      gain2.gain.setValueAtTime(0.6, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.0);
    } catch {
      // Audio fallback silent fail
    }
  }

  /**
   * Urgent rush alert for priority orders or when chef is paged
   */
  public playUrgentAlert(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // Audio fallback silent fail
    }
  }

  /**
   * Speaks verbally through the device speaker to summon the chef.
   * e.g. "Chef! Table 3: Two Burgers and One Special Fries, please start now!"
   */
  public speakOrderToChef(message: string): void {
    if (!this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback
    }
  }
}

export const audioService = new AudioService();
