class SoundManager {
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    if (!this.context) {
      try {
        this.context = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }

  async loadSound(name: string, url: string): Promise<void> {
    if (!this.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  playSound(name: string, volumeOverride?: number): void {
    if (!this.enabled || !this.context || !this.sounds.has(name)) {
      return;
    }

    try {
      const audioBuffer = this.sounds.get(name)!;
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = volumeOverride ?? this.volume;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  // Create simple beep sounds programmatically
  createBeep(frequency: number = 440, duration: number = 200): void {
    if (!this.enabled || !this.context) return;

    try {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.3, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);

      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Failed to create beep:', error);
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

export const soundManager = new SoundManager();

// Predefined sound effects using simple tones
export const playAttackSound = () => soundManager.createBeep(200, 300);
export const playHitSound = () => soundManager.createBeep(150, 150);
export const playVictorySound = () => {
  soundManager.createBeep(523, 200); // C
  setTimeout(() => soundManager.createBeep(659, 200), 200); // E
  setTimeout(() => soundManager.createBeep(784, 300), 400); // G
};
export const playDefeatSound = () => {
  soundManager.createBeep(400, 200);
  setTimeout(() => soundManager.createBeep(300, 200), 200);
  setTimeout(() => soundManager.createBeep(200, 400), 400);
};
export const playSelectSound = () => soundManager.createBeep(800, 100);
export const playErrorSound = () => soundManager.createBeep(200, 500);
