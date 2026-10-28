// Web Audio API Sound Synthesizer for Kitchen and Register alerts

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
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

  /**
   * Sound when a new order arrives at the KDS (Two-tone alert)
   */
  public playNewOrder(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // First tone (E5 ~ 659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second tone higher (B5 ~ 987Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Sound when an order is ready for pickup / Calling customer
   */
  public playOrderReady(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // 3-tone airport/counter chime: G4 (392Hz) -> C5 (523Hz) -> E5 (659Hz)
      const notes = [392.00, 523.25, 659.25];
      notes.forEach((freq, i) => {
        const time = now + i * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
      });
    } catch {}
  }

  /**
   * Cash register sound on payment confirmation
   */
  public playCashRegister(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Click / mechanical latch
      const oscClick = ctx.createOscillator();
      const clickGain = ctx.createGain();
      oscClick.type = 'square';
      oscClick.frequency.setValueAtTime(180, now);
      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      oscClick.connect(clickGain);
      clickGain.connect(ctx.destination);
      oscClick.start(now);
      oscClick.stop(now + 0.09);

      // Bell chime (C6 ~ 1046Hz)
      const oscBell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      oscBell.type = 'sine';
      oscBell.frequency.setValueAtTime(1046.5, now + 0.06);
      bellGain.gain.setValueAtTime(0.35, now + 0.06);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      oscBell.connect(bellGain);
      bellGain.connect(ctx.destination);
      oscBell.start(now + 0.06);
      oscBell.stop(now + 0.75);
    } catch {}
  }

  /**
   * Subtle click feedback for touch button taps
   */
  public playTap(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }
}

export const soundManager = new SoundManager();
