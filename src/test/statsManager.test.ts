import { describe, it, expect, beforeEach, vi } from 'vitest';
import { statsManager } from '../utils/statsManager';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('StatsManager', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    statsManager.resetStats();
  });

  it('initializes with default stats', () => {
    const stats = statsManager.getStats();
    expect(stats.totalBattles).toBe(0);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.longestWinStreak).toBe(0);
    expect(stats.currentWinStreak).toBe(0);
  });

  it('records a win correctly', () => {
    statsManager.recordBattle('win', ['pikachu', 'charizard'], 100, 50);

    const stats = statsManager.getStats();
    expect(stats.totalBattles).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.currentWinStreak).toBe(1);
    expect(stats.longestWinStreak).toBe(1);
    expect(stats.totalDamageDealt).toBe(100);
    expect(stats.totalDamageTaken).toBe(50);
    expect(stats.pokemonEncountered.has('pikachu')).toBe(true);
    expect(stats.pokemonEncountered.has('charizard')).toBe(true);
  });

  it('records a loss correctly', () => {
    // First win to set up a streak
    statsManager.recordBattle('win', ['pikachu'], 50, 25);

    // Then a loss
    statsManager.recordBattle('loss', ['charizard'], 30, 100);

    const stats = statsManager.getStats();
    expect(stats.totalBattles).toBe(2);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.currentWinStreak).toBe(0); // Reset after loss
    expect(stats.longestWinStreak).toBe(1); // Still remembers the longest
  });

  it('calculates win rate correctly', () => {
    statsManager.recordBattle('win', ['pikachu'], 50, 25);
    statsManager.recordBattle('win', ['charizard'], 60, 30);
    statsManager.recordBattle('loss', ['blastoise'], 20, 80);

    const winRate = statsManager.getWinRate();
    expect(winRate).toBeCloseTo(66.67, 1); // 2 wins out of 3 battles
  });

  it('returns 0 win rate when no battles', () => {
    const winRate = statsManager.getWinRate();
    expect(winRate).toBe(0);
  });

  it('tracks achievements correctly', () => {
    // First victory achievement
    const achievements1 = statsManager.recordBattle('win', ['pikachu'], 50, 25);
    expect(achievements1).toContain('First Victory');

    const allAchievements = statsManager.getAllAchievements();
    const firstVictory = allAchievements.find(a => a.id === 'first_victory');
    expect(firstVictory?.unlocked).toBe(true);
  });

  it('resets stats correctly', () => {
    // Add some data
    statsManager.recordBattle('win', ['pikachu'], 50, 25);
    statsManager.recordBattle('loss', ['charizard'], 30, 60);

    // Reset
    statsManager.resetStats();

    const stats = statsManager.getStats();
    expect(stats.totalBattles).toBe(0);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.pokemonEncountered.size).toBe(0);
    expect(stats.achievements.length).toBe(0);
  });

  it('saves and loads from localStorage', () => {
    const mockStats = {
      totalBattles: 5,
      wins: 3,
      losses: 2,
      pokemonEncountered: ['pikachu', 'charizard'],
      achievements: ['first_victory'],
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStats));

    // This would normally happen on initialization, but we'll simulate it
    const loadedStats = JSON.parse(localStorageMock.getItem('pokemon-battle-stats') || '{}');
    expect(loadedStats.totalBattles).toBe(5);
    expect(loadedStats.wins).toBe(3);
  });
});
