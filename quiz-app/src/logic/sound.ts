type AudioContextConstructor = typeof AudioContext;

interface WebKitAudioWindow extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

class SoundService {
  private audioCtx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as WebKitAudioWindow).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Could not play sound:", e);
    }
  }

  public playCorrect() {
    this.playTone(600, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(800, 'sine', 0.25, 0.08), 100);
  }

  public playWrong() {
    this.playTone(300, 'triangle', 0.2, 0.08);
    setTimeout(() => this.playTone(250, 'triangle', 0.35, 0.08), 150);
  }

  public playMilestone() {
    this.playTone(440, 'sine', 0.1, 0.06);
    setTimeout(() => this.playTone(554, 'sine', 0.1, 0.06), 100);
    setTimeout(() => this.playTone(659, 'sine', 0.15, 0.06), 200);
    setTimeout(() => this.playTone(880, 'sine', 0.4, 0.06), 300);
  }

  public playPop() {
    this.playTone(800, 'sine', 0.06, 0.03);
  }
}

export const soundEngine = new SoundService();
