import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the ToastProvider
vi.mock('../components/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock the sound manager
vi.mock('../utils/soundManager', () => ({
  soundManager: {
    setEnabled: vi.fn(),
    setVolume: vi.fn(),
    isEnabled: vi.fn(() => true),
    getVolume: vi.fn(() => 0.5),
  },
  playAttackSound: vi.fn(),
  playSelectSound: vi.fn(),
}));

// Mock the stats manager
vi.mock('../utils/statsManager', () => ({
  statsManager: {
    getStats: vi.fn(() => ({
      totalBattles: 0,
      wins: 0,
      losses: 0,
      favoritePokemon: [],
      pokemonEncountered: new Set(),
      longestWinStreak: 0,
      currentWinStreak: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      battlesByType: {},
      achievements: [],
    })),
    getWinRate: vi.fn(() => 0),
    getAllAchievements: vi.fn(() => []),
    getAchievements: vi.fn(() => []),
    recordBattleStart: vi.fn(),
    recordBattleEnd: vi.fn(),
    recordPokemonUsed: vi.fn(),
    recordDamage: vi.fn(),
  },
}));

// Mock API service
vi.mock('../services/pokeapi', () => ({
  getPokemonDetails: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: 'pikachu',
      hp: 100,
      maxHp: 100,
      types: [{ type: { name: 'electric' } }],
      sprites: {
        front_default: 'test-image.png',
        other: { 'official-artwork': { front_default: 'test-artwork.png' } },
      },
      attacks: [],
      weaknesses: [],
      resistances: [],
      typeEffectiveness: {},
      height: 4,
      weight: 60,
      abilities: [],
      stats: [],
    })
  ),
  getAllPokemonNames: vi.fn(() => Promise.resolve([{ name: 'pikachu' }, { name: 'charizard' }])),
}));

describe('App Component', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText('Pokémon Battle Arena')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(
      screen.getByText(
        'Search for a Pokémon to build your team and start a battle, or view its evolution tree.'
      )
    ).toBeInTheDocument();
  });

  it('renders the settings button', () => {
    render(<App />);
    const settingsButton = screen.getByTitle('Settings');
    expect(settingsButton).toBeInTheDocument();
  });

  it('renders the statistics button', () => {
    render(<App />);
    const statsButton = screen.getByTitle('Statistics');
    expect(statsButton).toBeInTheDocument();
  });

  it('renders the popular pokemon section', () => {
    render(<App />);
    expect(screen.getByText('Popular Pokémon')).toBeInTheDocument();
  });
});
