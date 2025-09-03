import React, { useState, useEffect, useCallback, DragEvent } from 'react';
import type { Pokemon } from '../types';
import { getPokemonDetails } from '../services/pokeapi';
import { TEAM_SIZE, POPULAR_POKEMON } from '../constants';
import { AutocompleteSearch } from './AutocompleteSearch';
import { LoadingSpinner } from './LoadingSpinner';
import { PokemonCard } from './PokemonCard';

interface TeamSelectionProps {
  initialPokemonName: string | null;
  onTeamConfirm: (team: Pokemon[]) => void;
  onBack: () => void;
}

const TeamSlot: React.FC<{
  pokemon: Pokemon | null;
  onRemove?: (id: number) => void;
  index: number;
  onDragStart: (e: DragEvent<HTMLDivElement>, pokemon: Pokemon, index: number) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, index: number) => void;
  isDragged: boolean;
}> = ({ pokemon, onRemove, index, onDragStart, onDragOver, onDrop, isDragged }) => {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver(e);
  };

  if (!pokemon) {
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={e => onDrop(e, index)}
        className="w-full max-w-sm aspect-[63/88] bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-[5%/3.5%] flex flex-col items-center justify-center text-slate-500 transition-colors duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-semibold text-lg">Slot {index + 1}</span>
        <span className="text-sm">Drop Pokémon Here</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, pokemon, index)}
      onDragOver={handleDragOver}
      onDrop={e => onDrop(e, index)}
      className={`w-full max-w-sm transition-all duration-300 cursor-grab ${isDragged ? 'opacity-30' : ''}`}
    >
      <PokemonCard
        pokemon={pokemon}
        isActive={false}
        isPlayer={true}
        onRemove={onRemove ? () => onRemove(pokemon.id) : undefined}
        displayMode="compact"
      />
    </div>
  );
};

export const TeamSelection: React.FC<TeamSelectionProps> = ({
  initialPokemonName,
  onTeamConfirm,
  onBack,
}) => {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [popularPokemon, setPopularPokemon] = useState<Pokemon[]>([]);
  const [draggedItem, setDraggedItem] = useState<Pokemon | null>(null);
  const dragSourceIndex = React.useRef<number | null>(null);
  const dragSourceType = React.useRef<'team' | 'popular' | null>(null);

  const addPokemonToTeam = useCallback(
    async (name: string, targetIndex?: number) => {
      if (team.length >= TEAM_SIZE && typeof targetIndex === 'undefined') {
        setError(`You can only have ${TEAM_SIZE} Pokémon in your team.`);
        return;
      }
      if (team.some(p => p.name === name)) {
        setError(`${name} is already in your team.`);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const pokemonDetails = await getPokemonDetails(name);
        if (pokemonDetails) {
          setTeam(currentTeam => {
            const newTeam = [...currentTeam];
            if (typeof targetIndex !== 'undefined') {
              newTeam[targetIndex] = pokemonDetails;
            } else {
              // Find first empty slot
              const emptyIndex = newTeam.findIndex(p => !p);
              if (emptyIndex !== -1) {
                newTeam[emptyIndex] = pokemonDetails;
              } else {
                newTeam.push(pokemonDetails);
              }
            }
            return newTeam.slice(0, TEAM_SIZE);
          });
        } else {
          setError(`Could not find details for ${name}.`);
        }
      } catch (_err) {
        setError('Failed to fetch Pokémon details.');
      } finally {
        setIsLoading(false);
      }
    },
    [team]
  );

  useEffect(() => {
    if (initialPokemonName) {
      addPokemonToTeam(initialPokemonName);
    }

    const fetchPopular = async () => {
      const promises = POPULAR_POKEMON.map(name => getPokemonDetails(name));
      const results = await Promise.all(promises);
      setPopularPokemon(results.filter((p): p is Pokemon => p !== null));
    };
    fetchPopular();
  }, [initialPokemonName, addPokemonToTeam]);

  const handleRemovePokemon = (id: number) => {
    setTeam(
      currentTeam => currentTeam.map(p => (p?.id === id ? null : p)).filter(Boolean) as Pokemon[]
    );
  };

  const handleDragStart = (
    e: DragEvent,
    pokemon: Pokemon,
    sourceType: 'team' | 'popular',
    index?: number
  ) => {
    setDraggedItem(pokemon);
    dragSourceType.current = sourceType;
    if (sourceType === 'team') {
      dragSourceIndex.current = index!;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pokemon.name);
  };

  const handleDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newTeam = [...team];

    // Prevent dropping on a slot if the Pokémon is already in the team (unless it's a reorder)
    if (team.some(p => p?.id === draggedItem.id) && dragSourceType.current !== 'team') {
      setError(`${draggedItem.name} is already in your team.`);
      setDraggedItem(null);
      return;
    }

    // The item being replaced at the target index
    const displacedItem = newTeam[targetIndex];

    // Place dragged item at the target
    newTeam[targetIndex] = draggedItem;

    if (dragSourceType.current === 'team' && dragSourceIndex.current !== null) {
      // Reordering from within the team
      const sourceIndex = dragSourceIndex.current;
      // If there was an item at the target, move it to the source, otherwise remove the source
      newTeam[sourceIndex] = displacedItem || null;
    } else if (dragSourceType.current === 'popular' && newTeam.length > TEAM_SIZE) {
      // Adding from popular list, remove last item if team is full
      // This is a simplistic way to handle overflow, better logic might be needed
      newTeam.pop();
    }

    // Filter out nulls if you want a compact list, or keep them for fixed slots.
    // Let's keep them for fixed slots.
    setTeam(newTeam.slice(0, TEAM_SIZE));

    setDraggedItem(null);
    dragSourceIndex.current = null;
    dragSourceType.current = null;
  };

  const teamIsFull = team.filter(Boolean).length === TEAM_SIZE;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <button
        onClick={onBack}
        className="mb-8 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-transform transform hover:scale-105"
      >
        &larr; Back to Menu
      </button>

      <h1 className="text-4xl font-bold text-center mb-2">Build Your Team</h1>
      <p className="text-slate-300 text-center mb-8">
        Choose {TEAM_SIZE} Pokémon. Drag and drop to build your team or reorder.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center gap-8 mb-8">
        {Array.from({ length: TEAM_SIZE }).map((_, index) => (
          <TeamSlot
            key={team[index]?.id || `empty-${index}`}
            pokemon={team[index] || null}
            onRemove={team[index] ? handleRemovePokemon : undefined}
            index={index}
            onDragStart={(e, p) => handleDragStart(e, p, 'team', index)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            isDragged={draggedItem?.id === team[index]?.id && dragSourceType.current === 'team'}
          />
        ))}
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {teamIsFull && (
        <div className="text-center mb-8">
          <button
            onClick={() => onTeamConfirm(team.filter(Boolean) as Pokemon[])}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-full font-bold text-xl transition-transform transform hover:scale-110 shadow-lg"
          >
            Let's Battle!
          </button>
        </div>
      )}

      {!teamIsFull && (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Add Pokémon</h2>
          <AutocompleteSearch onSelectPokemon={name => addPokemonToTeam(name)} />

          <h3 className="text-xl font-bold text-center mt-8 mb-4">
            Or click/drag a popular one to a slot:
          </h3>
          {popularPokemon.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {popularPokemon.map(p => {
                const isAdded = team.some(tp => tp?.id === p.id);
                const isClickable = !isAdded && !isLoading && !teamIsFull;

                return (
                  <div
                    key={p.id}
                    draggable={isClickable}
                    onDragStart={e => isClickable && handleDragStart(e, p, 'popular')}
                    onClick={() => isClickable && addPokemonToTeam(p.name)}
                    className={`bg-slate-800 rounded-lg p-2 shadow-md transition-all ${
                      isClickable
                        ? 'cursor-pointer hover:bg-slate-700 hover:scale-105'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <img
                      src={p.sprites.front_default}
                      alt={p.name}
                      className="mx-auto h-16 w-16 pointer-events-none"
                    />
                    <p className="capitalize font-semibold text-xs mt-1 pointer-events-none">
                      {p.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
