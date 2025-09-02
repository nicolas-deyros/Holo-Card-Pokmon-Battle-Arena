import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PokemonCard } from '../components/PokemonCard';
import type { Pokemon } from '../types';

const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  hp: 80,
  maxHp: 100,
  types: [{ type: { name: 'electric' } }],
  sprites: {
    front_default: 'https://example.com/pikachu.png',
    other: {
      'official-artwork': {
        front_default: 'https://example.com/pikachu-artwork.png',
      },
    },
  },
  attacks: [
    { name: 'Thunder Shock', power: 40, type: 'electric' },
    { name: 'Quick Attack', power: 30, type: 'normal' },
  ],
  weaknesses: ['ground'],
  resistances: ['flying', 'steel'],
  typeEffectiveness: {},
  height: 4,
  weight: 60,
  abilities: [{ name: 'static', isHidden: false }],
  stats: [
    { name: 'hp', value: 35 },
    { name: 'attack', value: 55 },
  ],
};

describe('PokemonCard Component', () => {
  it('renders pokemon name', () => {
    render(
      <PokemonCard pokemon={mockPokemon} isActive={false} isPlayer={true} displayMode="full" />
    );
    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('renders pokemon HP', () => {
    render(
      <PokemonCard pokemon={mockPokemon} isActive={false} isPlayer={true} displayMode="full" />
    );
    expect(screen.getByText('80/100')).toBeInTheDocument();
  });

  it('renders pokemon types', () => {
    render(
      <PokemonCard pokemon={mockPokemon} isActive={false} isPlayer={true} displayMode="full" />
    );
    expect(screen.getByText('electric')).toBeInTheDocument();
  });

  it('renders attacks when active and player', () => {
    render(
      <PokemonCard pokemon={mockPokemon} isActive={true} isPlayer={true} displayMode="full" />
    );
    expect(screen.getByText('Thunder Shock')).toBeInTheDocument();
    expect(screen.getByText('Quick Attack')).toBeInTheDocument();
  });

  it('calls onAttack when attack button is clicked', () => {
    const mockOnAttack = vi.fn();
    render(
      <PokemonCard
        pokemon={mockPokemon}
        isActive={true}
        isPlayer={true}
        onAttack={mockOnAttack}
        displayMode="full"
      />
    );

    const thunderShockButton = screen.getByText('Thunder Shock').closest('button');
    if (thunderShockButton) {
      fireEvent.click(thunderShockButton);
      expect(mockOnAttack).toHaveBeenCalledWith({
        name: 'Thunder Shock',
        power: 40,
        type: 'electric',
      });
    }
  });

  it('renders remove button when onRemove is provided', () => {
    const mockOnRemove = vi.fn();
    render(
      <PokemonCard
        pokemon={mockPokemon}
        isActive={false}
        isPlayer={true}
        onRemove={mockOnRemove}
        displayMode="full"
      />
    );

    const removeButton = screen.getByLabelText('Remove Pokémon');
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const mockOnRemove = vi.fn();
    render(
      <PokemonCard
        pokemon={mockPokemon}
        isActive={false}
        isPlayer={true}
        onRemove={mockOnRemove}
        displayMode="full"
      />
    );

    const removeButton = screen.getByLabelText('Remove Pokémon');
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('renders with different display modes', () => {
    const { rerender } = render(
      <PokemonCard pokemon={mockPokemon} isActive={false} isPlayer={true} displayMode="compact" />
    );
    expect(screen.getByText('pikachu')).toBeInTheDocument();

    rerender(
      <PokemonCard pokemon={mockPokemon} isActive={false} isPlayer={true} displayMode="hand" />
    );
    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('renders placeholder when pokemon is null', () => {
    const { container } = render(
      <PokemonCard pokemon={null} isActive={false} isPlayer={true} displayMode="full" />
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('Waiting for Pokémon...')).toBeInTheDocument();
  });
});
