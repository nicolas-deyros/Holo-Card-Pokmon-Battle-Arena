import React, { useState, useEffect } from 'react';
import { getEvolutionLine, getPokemonDetails, getRelatedPokemonByType } from '../services/pokeapi';
import { LoadingSpinner } from './LoadingSpinner';
import { DetailSection } from './DetailSection';
import { SubsectionTitle } from './SubsectionTitle';
import { PokemonCard } from './PokemonCard';
import { RadarChart } from './RadarChart';
import type { Pokemon } from '../types';

interface EvolutionMapProps {
  pokemonName: string;
  onBack: () => void;
  onNavigateToPokemon?: (pokemonName: string) => void;
}

// Simplified to match getEvolutionLine() which returns an ordered array
type EvolutionChainItem = Pokemon;

export const EvolutionMap: React.FC<EvolutionMapProps> = ({
  pokemonName,
  onBack,
  onNavigateToPokemon,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChainItem[]>([]);
  const [relatedPokemon, setRelatedPokemon] = useState<Pokemon[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvolutionData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Get the main Pokemon details
        const pokemonDetails = await getPokemonDetails(pokemonName);
        if (!pokemonDetails) {
          setError('Pokemon not found');
          return;
        }
        setPokemon(pokemonDetails);

        // Get evolution line as an ordered array
        const evoLine = await getEvolutionLine(pokemonName);
        if (evoLine && evoLine.length > 0) {
          setEvolutionChain(evoLine);
        } else {
          // If no evolution line found, create one with just the current Pokemon
          setEvolutionChain([pokemonDetails]);
        }

        // Fetch related Pokémon (by first type)
        const primaryType = pokemonDetails.types[0]?.type.name;
        if (primaryType) {
          const related = await getRelatedPokemonByType(primaryType, {
            limit: 6,
            excludeName: pokemonDetails.name,
          });
          setRelatedPokemon(related);
        } else {
          setRelatedPokemon([]);
        }
      } catch (err) {
        setError('Failed to fetch evolution data');
        console.error('Evolution fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvolutionData();
  }, [pokemonName]);

  const getStageText = (index: number) => {
    if (index === 0) return 'Base';
    return `Stage ${index + 1}`;
  };

  const handlePokemonClick = (selectedPokemonName: string) => {
    if (selectedPokemonName !== pokemonName) {
      // Use the parent callback to navigate to the selected Pokemon
      if (onNavigateToPokemon) {
        onNavigateToPokemon(selectedPokemonName);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <button
          onClick={onBack}
          className="mb-8 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-transform transform hover:scale-105"
        >
          ← Back to Menu
        </button>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <button
          onClick={onBack}
          className="mb-8 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-transform transform hover:scale-105"
        >
          ← Back to Menu
        </button>
        <div className="text-center text-red-500">
          <p>{error || 'Failed to load Pokemon data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <button
        onClick={onBack}
        className="mb-8 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-transform transform hover:scale-105"
      >
        ← Back to Menu
      </button>

      <div className="flex flex-col gap-12">
        {/* Pokemon Details Section - Centered */}
        <DetailSection
          title={`${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} Details`}
          className=""
        >
          <div className="flex justify-center">
            <PokemonCard
              pokemon={pokemon}
              isActive={false}
              isPlayer={true}
              displayMode="compact"
              isStatic={true}
            />
          </div>
        </DetailSection>

        {/* Combined Information Section */}
        <DetailSection title="Pokemon Information" className="">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400">Height:</span>
                  <span className="ml-2 text-white">{pokemon.height / 10} m</span>
                </div>
                <div>
                  <span className="text-slate-400">Weight:</span>
                  <span className="ml-2 text-white">{pokemon.weight / 10} kg</span>
                </div>
                <div>
                  <span className="text-slate-400">Types:</span>
                  <div className="flex gap-2 mt-1">
                    {pokemon.types.map((typeObj, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-bold bg-slate-700 text-white"
                      >
                        {typeof typeObj === 'string'
                          ? typeObj.charAt(0).toUpperCase() + typeObj.slice(1)
                          : typeObj.type.name.charAt(0).toUpperCase() + typeObj.type.name.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weaknesses */}
              {pokemon.weaknesses && pokemon.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-yellow-300 mb-3">Type Weaknesses</h4>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.weaknesses.map(t => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-sm font-bold bg-red-700/60 text-white capitalize"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {pokemon.stats && pokemon.stats.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Stats</h3>
                {/* Individual Stat Bars */}
                <div className="space-y-3">
                  {pokemon.stats.map(stat => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">
                        {stat.name
                          .replace('special-', 'Sp. ')
                          .replace('attack', 'Atk')
                          .replace('defense', 'Def')
                          .replace('speed', 'Speed')
                          .replace('hp', 'HP')}
                        :
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold w-12 text-right">{stat.value}</span>
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.value >= 100
                                ? 'bg-green-500'
                                : stat.value >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min((stat.value / 255) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="mt-6 flex justify-center">
                  <RadarChart
                    labels={pokemon.stats.map(s =>
                      s.name
                        .replace('special-', 'Sp. ')
                        .replace('attack', 'Atk')
                        .replace('defense', 'Def')
                        .replace('speed', 'Speed')
                        .replace('hp', 'HP')
                    )}
                    values={pokemon.stats.map(s => s.value)}
                    maxValue={255}
                    size={280}
                    levels={5}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Moves Section */}
          {pokemon.attacks && pokemon.attacks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">Moves</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pokemon.attacks.map(m => (
                  <div
                    key={m.name}
                    className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="capitalize text-white">{m.name}</div>
                    <div className="text-sm text-slate-300">
                      {m.type} {m.power ? `• ${m.power}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DetailSection>

        {/* Evolution Chain Section */}
        {evolutionChain.length > 0 && (
          <DetailSection title="Evolution Line" className="">
            <SubsectionTitle
              description={`Evolution chain for ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`}
            >
              {evolutionChain.length === 1 ? 'Single Stage Pokemon' : 'Evolution Stages'}
            </SubsectionTitle>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {evolutionChain.map((p, index) => {
                return (
                  <React.Fragment key={p.id}>
                    <div className="flex flex-col items-center">
                      <div className="font-medium text-slate-400 mb-2">{getStageText(index)}</div>
                      <div
                        className={`cursor-pointer transition-transform hover:scale-105 ${
                          p.name === pokemonName ? 'ring-2 ring-yellow-400 rounded-lg' : ''
                        }`}
                        onClick={() => handlePokemonClick(p.name)}
                      >
                        <PokemonCard
                          pokemon={p}
                          isActive={p.name === pokemonName}
                          isPlayer={true}
                          displayMode="compact"
                          isStatic={true}
                        />
                      </div>
                    </div>
                    {index < evolutionChain.length - 1 && (
                      <div className="hidden sm:block text-4xl text-yellow-400 mx-4">→</div>
                    )}
                    {index < evolutionChain.length - 1 && (
                      <div className="sm:hidden text-4xl text-yellow-400 my-2">↓</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </DetailSection>
        )}

        {/* Related Pokémon using Holo card */}
        {relatedPokemon.length > 0 && (
          <DetailSection title="Related Pokémon" className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedPokemon.map(rp => (
                <div
                  key={rp.id}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handlePokemonClick(rp.name)}
                >
                  <PokemonCard
                    pokemon={rp}
                    isActive={false}
                    isPlayer={true}
                    displayMode="compact"
                    isStatic={true}
                  />
                </div>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
};
