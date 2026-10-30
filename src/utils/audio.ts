// Cosmic Audio Engine: HTML5 Song Player & Interactive Twinkle Synthesizer
// Supports background mp3 playback, timeupdate listeners for floating lyrics,
// smooth volume ramping, and Web Audio API crystalline chimes on heart tap.

class CosmicAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = true;
  private shouldPlay: boolean = false;
  private currentSrc: string = '';
  private timeListeners: Set<(time: number) => void> = new Set();
  private stateListeners: Set<(isPlaying: boolean) => void> = new Set();
  private volumeListeners: Set<(volume: number) => void> = new Set();
  private fadeTimer: number | null = null;
  private rafId: number | null = null;
  private lastReportedTime: number = -1;
  private userVolume: number = 0.85;
  private lastNonZeroVolume: number = 0.85;

  // Web Audio Context for crystalline chimes on heart tap
  private chimeCtx: AudioContext | null = null;
  private chimeGain: GainNode | null = null;

  constructor() {
    this.isMuted = true;
    this.userVolume = 0.85;
    this.lastNonZeroVolume = 0.85;
  }

  private startTicker() {
    if (this.rafId !== null) return;

    const tick = () => {
      if (this.audio && !this.audio.paused && !this.isMuted) {
        const time = this.audio.currentTime;

        // Detect loop or restart: if time jumped backwards by more than 0.5s
        const didLoop = this.lastReportedTime > 1.0 && time < 0.5;
        if (didLoop || Math.abs(time - this.lastReportedTime) >= 0.025) {
          this.lastReportedTime = time;
          this.timeListeners.forEach((fn) => fn(time));
        }

        this.rafId = requestAnimationFrame(tick);
      } else {
        this.stopTicker();
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopTicker() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public init(songSrc = '/song.mp3') {
    if (this.audio) return;
    this.currentSrc = songSrc;

    this.audio = new Audio(songSrc);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0;

    this.audio.addEventListener('timeupdate', () => {
      const time = this.audio ? this.audio.currentTime : 0;
      this.lastReportedTime = time;
      this.timeListeners.forEach((fn) => fn(time));
    });

    this.audio.addEventListener('seeked', () => {
      const time = this.audio ? this.audio.currentTime : 0;
      this.lastReportedTime = time;
      this.timeListeners.forEach((fn) => fn(time));
    });

    this.audio.addEventListener('ended', () => {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.lastReportedTime = 0;
        this.timeListeners.forEach((fn) => fn(0));
      }
      this.stopTicker();
    });

    this.audio.addEventListener('play', () => {
      this.isMuted = false;
      this.stateListeners.forEach((fn) => fn(true));
      this.startTicker();
    });

    this.audio.addEventListener('pause', () => {
      this.isMuted = true;
      this.stateListeners.forEach((fn) => fn(false));
      this.stopTicker();
    });
  }

  public setSong(songSrc: string) {
    if (!this.audio) {
      this.init(songSrc);
      return;
    }

    if (this.currentSrc !== songSrc) {
      const wasPlaying = !this.audio.paused && !this.isMuted;
      this.currentSrc = songSrc;
      this.audio.src = songSrc;
      this.audio.currentTime = 0;
      this.timeListeners.forEach((fn) => fn(0));

      if (wasPlaying) {
        this.audio.play().catch(() => {});
      }
    }
  }

  public toggle(): boolean {
    if (!this.audio) {
      this.init();
    }
    if (this.isPlaying()) {
      if (this.userVolume > 0) {
        this.lastNonZeroVolume = this.userVolume;
      }
      this.pause();
      this.volumeListeners.forEach((fn) => fn(0));
      return false;
    } else {
      if (this.userVolume <= 0) {
        this.userVolume = this.lastNonZeroVolume > 0 ? this.lastNonZeroVolume : 0.85;
      }
      this.play();
      this.volumeListeners.forEach((fn) => fn(this.userVolume));
      return true;
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));

    if (clamped === 0) {
      this.userVolume = 0;
      this.isMuted = true;
      this.shouldPlay = false;

      if (this.fadeTimer) {
        window.clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }

      if (this.audio) {
        this.audio.volume = 0;
        if (!this.audio.paused) {
          this.audio.pause();
        }
      }

      this.stateListeners.forEach((fn) => fn(false));
      this.volumeListeners.forEach((fn) => fn(0));
      return;
    }

    this.userVolume = clamped;
    this.lastNonZeroVolume = clamped;

    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    if (this.audio) {
      this.audio.volume = clamped;
    }

    if (this.isMuted || !this.isPlaying()) {
      this.isMuted = false;
      this.shouldPlay = true;

      if (this.audio) {
        const p = this.audio.play();
        if (p !== undefined) {
          p.then(() => {
            this.startTicker();
            this.stateListeners.forEach((fn) => fn(true));
          }).catch(() => {});
        }
      } else {
        this.init();
        this.play();
      }
      this.stateListeners.forEach((fn) => fn(true));
    }

    this.volumeListeners.forEach((fn) => fn(clamped));
  }

  public getVolume(): number {
    return this.isMuted ? 0 : this.userVolume;
  }

  public getRawVolume(): number {
    return this.userVolume;
  }

  public isPlaying(): boolean {
    return this.shouldPlay && !this.isMuted && !!this.audio && !this.audio.paused;
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  public seek(seconds: number) {
    if (!this.audio) {
      this.init();
    }
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.lastReportedTime = seconds;
      this.timeListeners.forEach((fn) => fn(seconds));
    }
  }

  public play() {
    this.shouldPlay = true;
    if (!this.audio) {
      this.init();
    }
    if (!this.audio) return;

    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    if (this.userVolume <= 0) {
      this.userVolume = this.lastNonZeroVolume > 0 ? this.lastNonZeroVolume : 0.85;
    }

    this.isMuted = false;
    this.stateListeners.forEach((fn) => fn(true));
    this.volumeListeners.forEach((fn) => fn(this.userVolume));

    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // If pause was called while promise was resolving, halt playback immediately!
          if (!this.shouldPlay) {
            if (this.audio) {
              this.audio.pause();
              this.audio.volume = 0;
            }
            this.isMuted = true;
            this.stateListeners.forEach((fn) => fn(false));
            return;
          }

          this.startTicker();

          // Smooth volume fade-in up to this.userVolume
          let currentVol = this.audio ? this.audio.volume : 0;
          const targetVol = this.userVolume;
          const step = Math.max(0.02, (targetVol - currentVol) / 10);

          this.fadeTimer = window.setInterval(() => {
            if (!this.shouldPlay) {
              if (this.fadeTimer) {
                window.clearInterval(this.fadeTimer);
                this.fadeTimer = null;
              }
              return;
            }
            currentVol = Math.min(targetVol, currentVol + step);
            if (this.audio) this.audio.volume = currentVol;
            if (currentVol >= targetVol && this.fadeTimer) {
              window.clearInterval(this.fadeTimer);
              this.fadeTimer = null;
            }
          }, 40);
        })
        .catch(() => {
          this.isMuted = true;
          this.stateListeners.forEach((fn) => fn(false));
        });
    }
  }

  public pause(immediate = false) {
    this.shouldPlay = false;
    this.isMuted = true;
    this.stateListeners.forEach((fn) => fn(false));
    this.stopTicker();

    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    if (!this.audio) return;

    if (immediate) {
      this.audio.pause();
      this.audio.volume = 0;
      return;
    }

    // Gentle volume fade-down
    let currentVol = this.audio.volume;
    const step = currentVol > 0 ? currentVol / 6 : 0.1;

    this.fadeTimer = window.setInterval(() => {
      currentVol = Math.max(0, currentVol - step);
      if (this.audio) this.audio.volume = currentVol;

      if (currentVol <= 0 || !this.audio) {
        if (this.fadeTimer) {
          window.clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        if (this.audio) this.audio.pause();
      }
    }, 25);
  }

  public onTimeUpdate(callback: (time: number) => void): () => void {
    this.timeListeners.add(callback);
    if (this.audio) {
      callback(this.audio.currentTime);
    }
    return () => {
      this.timeListeners.delete(callback);
    };
  }

  public onStateChange(callback: (isPlaying: boolean) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.isPlaying());
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  public onVolumeChange(callback: (volume: number) => void): () => void {
    this.volumeListeners.add(callback);
    callback(this.getVolume());
    return () => {
      this.volumeListeners.delete(callback);
    };
  }

  // Interactive crystalline sparkle chime when tapping the stardust heart
  public playBurstSound() {
    // Strictly respect mute state: if user muted audio or volume is 0, play NOTHING!
    if (this.isMuted || !this.shouldPlay || this.userVolume <= 0) return;

    try {
      if (!this.chimeCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtxClass) return;
        this.chimeCtx = new AudioCtxClass();
        this.chimeGain = this.chimeCtx.createGain();
        this.chimeGain.connect(this.chimeCtx.destination);
      }

      if (this.chimeCtx.state === 'suspended') {
        this.chimeCtx.resume();
      }

      const notes = [659.25, 830.61, 1108.73, 1318.51, 1661.22];
      const masterVol = Math.max(0.1, this.userVolume);

      for (let i = 0; i < 3; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const osc = this.chimeCtx.createOscillator();
        const gain = this.chimeCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note;

        const now = this.chimeCtx.currentTime + i * 0.07;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.12 * masterVol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.chimeGain!);

        osc.start(now);
        osc.stop(now + 1.7);
      }
    } catch {
      // Audio context cleanup ignore
    }
  }
}

export const soundManager = new CosmicAudioEngine();
