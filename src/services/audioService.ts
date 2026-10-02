// Audio Service with Web Audio synthetic sound generator fallback & ducking
class AudioService {
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.6;
  private sfxVolume: number = 0.8;
  private isMuted: boolean = false;
  private bgMusicAudio: HTMLAudioElement | null = null;
  private lastClickTime: number = 0;
  private isDucked: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Lazy audio context initialization on user interaction
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgMusicAudio) {
      this.bgMusicAudio.muted = muted;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(master: number, music: number, sfx: number) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));

    if (this.bgMusicAudio) {
      const effectiveVol = this.isDucked 
        ? this.masterVolume * this.musicVolume * 0.15 
        : this.masterVolume * this.musicVolume;
      this.bgMusicAudio.volume = effectiveVol;
    }
  }

  // Audio ducking for videos
  public duckMusic(duck: boolean) {
    this.isDucked = duck;
    if (this.bgMusicAudio) {
      const targetVol = duck
        ? this.masterVolume * this.musicVolume * 0.18
        : this.masterVolume * this.musicVolume;
      this.bgMusicAudio.volume = Math.max(0, Math.min(1, targetVol));
    }
  }

  // Play synthetic tone using Web Audio API when teacher file isn't uploaded
  private playSyntheticTone(frequencies: number[], duration: number, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.15 * this.masterVolume * this.sfxVolume, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gainNode.connect(ctx.destination);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + idx * (duration / frequencies.length));
        osc.connect(gainNode);
        osc.start(now + idx * (duration / frequencies.length));
        osc.stop(now + duration);
      });
    } catch {
      // Silent catch
    }
  }

  // Click Sound (throttled 80ms)
  public playClick(customUrl?: string) {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastClickTime < 70) return;
    this.lastClickTime = now;

    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }
    // High-pitched soft pop
    this.playSyntheticTone([600, 800], 0.08, 'triangle');
  }

  // Correct Sound
  public playCorrect(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }
    // Cheerful major chord (C - E - G - C5)
    this.playSyntheticTone([523.25, 659.25, 783.99, 1046.50], 0.35, 'triangle');
  }

  // Wrong Sound
  public playWrong(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }
    // Gentle warning buzz
    this.playSyntheticTone([280, 240], 0.25, 'sawtooth');
  }

  // Item Unlock / Reward Fanfare
  public playReward(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }
    // Shimmering ascending chime
    this.playSyntheticTone([440, 554.37, 659.25, 880, 1108.73], 0.5, 'sine');
  }

  // Victory / Final Journey Celebration
  public playVictory(customUrl?: string) {
    if (this.isMuted) return;
    if (customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }
    this.playSyntheticTone([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.7, 'triangle');
  }

  private playCustomAudio(url: string) {
    try {
      const audio = new Audio(url);
      audio.volume = this.masterVolume * this.sfxVolume;
      audio.play().catch(() => {});
    } catch {
      // Silent
    }
  }
}

export const audioManager = new AudioService();
