
import React, { useState, useCallback } from 'react';
import { AutocompleteSearch } from './components/AutocompleteSearch';
import { Battlefield } from './components/Battlefield';
import { EvolutionMap } from './components/EvolutionMap';
import { TeamSelection } from './components/TeamSelection';
import { POPULAR_POKEMON } from './constants';
import type { Pokemon } from './types';
import { getPokemonDetails } from './services/pokeapi';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PokemonCard } from './components/PokemonCard';

type View = 'menu' | 'team_selection' | 'battle' | 'evolution';

const App: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(null);
  const [playerTeam, setPlayerTeam] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [popularPokemonDetails, setPopularPokemonDetails] = useState<Pokemon[]>([]);

  const fetchPopularPokemon = useCallback(async () => {
    setIsLoading(true);
    try {
      const promises = POPULAR_POKEMON.map(name => getPokemonDetails(name));
      const results = await Promise.all(promises);
      setPopularPokemonDetails(results.filter((p): p is Pokemon => p !== null));
    } catch (error) {
      console.error("Failed to fetch popular pokemon:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPopularPokemon();
  }, [fetchPopularPokemon]);


  const handleStartTeamSelection = (pokemonName: string) => {
    setSelectedPokemonName(pokemonName);
    setView('team_selection');
  };

  const handleConfirmTeam = (team: Pokemon[]) => {
    setPlayerTeam(team);
    setView('battle');
  }

  const handleViewEvolution = (pokemonName: string) => {
    setSelectedPokemonName(pokemonName);
    setView('evolution');
  };

  const handleBackToMenu = () => {
    setSelectedPokemonName(null);
    setPlayerTeam([]);
    setView('menu');
  };

  const renderView = () => {
    switch (view) {
      case 'team_selection':
        return <TeamSelection initialPokemonName={selectedPokemonName} onTeamConfirm={handleConfirmTeam} onBack={handleBackToMenu} />;
      case 'battle':
        return <Battlefield playerTeam={playerTeam} onBack={handleBackToMenu} />;
      case 'evolution':
        return selectedPokemonName && <EvolutionMap pokemonName={selectedPokemonName} onBack={handleBackToMenu} />;
      case 'menu':
      default:
        return (
          <div className="container mx-auto p-4 md:p-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-yellow-400 mb-2" style={{ textShadow: '2px 2px 4px #000000' }}>Pokémon Battle Arena</h1>
            <p className="text-slate-300 mb-8 text-lg">Search for a Pokémon to build your team and start a battle, or view its evolution tree.</p>
            <AutocompleteSearch onSelectPokemon={setSelectedPokemonName} />
            
             {selectedPokemonName && (
              <div className="mt-4 flex justify-center gap-4 animate-fade-in">
                <button 
                  onClick={() => handleStartTeamSelection(selectedPokemonName)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-full font-bold transition-transform transform hover:scale-105"
                >
                  Start Battle
                </button>
                <button 
                  onClick={() => handleViewEvolution(selectedPokemonName)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-transform transform hover:scale-105"
                >
                  View Evolution
                </button>
              </div>
            )}

            <h2 className="text-3xl font-bold mt-12 mb-6 text-yellow-300">Popular Pokémon</h2>
            {isLoading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {popularPokemonDetails.map(p => (
                   <div key={p.id} className="cursor-pointer" onClick={() => handleStartTeamSelection(p.name)}>
                    <PokemonCard
                        pokemon={p}
                        isActive={false}
                        isPlayer={true}
                        displayMode="compact"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div key={view} className="animate-fade-in-scale w-full">
       {renderView()}
      </div>
    </main>
  );
};

export default App;
