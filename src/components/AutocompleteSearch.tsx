import React, { useState, useEffect } from 'react';
import { getAllPokemonNames } from '../services/pokeapi';

interface AutocompleteSearchProps {
  onSelectPokemon: (pokemonName: string) => void;
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({ onSelectPokemon }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
  const [allPokemon, setAllPokemon] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const names = await getAllPokemonNames();
        setAllPokemon(names);
      } catch (error) {
        console.error('Failed to load pokemon list', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllPokemon();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 1) {
      const filteredSuggestions = allPokemon
        .filter(p => p.name.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (pokemonName: string) => {
    setQuery(pokemonName);
    setSuggestions([]);
    onSelectPokemon(pokemonName);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={isLoading ? 'Loading Pokémon...' : 'Search Pokémon...'}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-full text-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map(suggestion => (
            <li
              key={suggestion.name}
              onClick={() => handleSuggestionClick(suggestion.name)}
              className="px-4 py-2 text-left capitalize cursor-pointer hover:bg-slate-700 transition-colors"
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
