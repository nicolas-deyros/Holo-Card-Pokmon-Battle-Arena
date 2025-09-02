import { describe, it, expect, vi } from 'vitest';
import { soundManager } from '../utils/soundManager';

// Mock AudioContext
const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: { value: 0 },
  type: 'sine',
};

const mockGainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    value: 0,
  },
};

const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
};

global.AudioContext = vi.fn(() => mockAudioContext) as any;

describe('SoundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default settings', () => {
    expect(soundManager.isEnabled()).toBe(true);
    expect(soundManager.getVolume()).toBe(0.5);
  });

  it('can set and get volume', () => {
    soundManager.setVolume(0.8);
    expect(soundManager.getVolume()).toBe(0.8);

    // Test bounds
    soundManager.setVolume(1.5); // Should clamp to 1
    expect(soundManager.getVolume()).toBe(1);

    soundManager.setVolume(-0.5); // Should clamp to 0
    expect(soundManager.getVolume()).toBe(0);
  });

  it('can enable and disable sound', () => {
    soundManager.setEnabled(false);
    expect(soundManager.isEnabled()).toBe(false);

    soundManager.setEnabled(true);
    expect(soundManager.isEnabled()).toBe(true);
  });

  it('creates beep sounds when enabled', () => {
    // Force the sound manager to have a proper context
    (soundManager as any).context = mockAudioContext;

    soundManager.setEnabled(true);
    soundManager.createBeep(440, 200);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('does not create sounds when disabled', () => {
    soundManager.setEnabled(false);
    soundManager.createBeep(440, 200);

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('sets correct frequency for beep', () => {
    // Force the sound manager to have a proper context
    (soundManager as any).context = mockAudioContext;

    soundManager.setEnabled(true);
    soundManager.createBeep(880, 300);

    expect(mockOscillator.frequency.value).toBe(880);
  });

  it('sets correct gain volume', () => {
    // Force the sound manager to have a proper context
    (soundManager as any).context = mockAudioContext;

    soundManager.setEnabled(true);
    soundManager.setVolume(0.6);
    soundManager.createBeep(440, 200);

    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
      0.18, // 0.6 * 0.3
      mockAudioContext.currentTime
    );
  });

  it('handles audio context creation errors gracefully', () => {
    // Mock AudioContext to throw an error
    global.AudioContext = vi.fn(() => {
      throw new Error('AudioContext not supported');
    }) as any;

    // This should not throw an error
    expect(() => {
      const newSoundManager = new (soundManager.constructor as any)();
      newSoundManager.createBeep(440, 200);
    }).not.toThrow();
  });
});
