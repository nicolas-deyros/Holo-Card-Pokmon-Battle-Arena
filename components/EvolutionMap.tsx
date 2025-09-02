import React, { useState, useEffect } from 'react';
import { getEvolutionLine, getPokemonDetails } from '../services/pokeapi';
import { LoadingSpinner } from './LoadingSpinner';
import type { Pokemon, Attack } from '../types';
import { TYPE_COLORS } from '../constants';

interface EvolutionMapProps {
  pokemonName: string;
  onBack: () => void;
}

const STAT_MAP: { [key: string]: { label: string; max: number } } = {
  'hp': { label: 'HP', max: 255 },
  'attack': { label: 'Attack', max: 190 },
  'defense': { label: 'Defense', max: 230 },
  'special-attack': { label: 'Sp. Atk', max: 194 },
  'special-defense': { label: 'Sp. Def', max: 230 },
  'speed': { label: 'Speed', max: 180 },
};
const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];


const TypeBadge: React.FC<{ typeName: string; size?: 'sm' | 'md' }> = ({ typeName, size = 'md' }) => (
    <span className={`font-bold uppercase rounded-md shadow-sm ${TYPE_COLORS[typeName] || 'bg-gray-500'} ${size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'}`}>
        {typeName}
    </span>
);

const StatsRadarChart: React.FC<{ stats: Pokemon['stats'] }> = ({ stats }) => {
    const size = 300;
    const center = size / 2;
    const radius = center * 0.7;

    const statValues = STAT_ORDER.map(statName => stats.find(s => s.name === statName)?.value || 0);

    const points = statValues.map((value, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const statMax = STAT_MAP[STAT_ORDER[i]].max;
        const pointRadius = (value / statMax) * radius;
        const x = center + pointRadius * Math.cos(angle);
        const y = center + pointRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const axisPoints = STAT_ORDER.map((_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return { x, y };
    });

    const totalStats = statValues.reduce((sum, val) => sum + val, 0);

    return (
        <div className="relative flex flex-col items-center">
            <h3 className="absolute top-0 text-lg font-bold">Stats ({totalStats} total)</h3>
            <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
                <defs>
                    <linearGradient id="polyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(74, 222, 128, 0.5)' }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(96, 165, 250, 0.5)'}} />
                    </linearGradient>
                </defs>
                <g transform={`translate(${center}, ${center})`}>
                    {[0.25, 0.5, 0.75, 1].map(scale => (
                        <polygon
                            key={scale}
                            points={STAT_ORDER.map((_, i) => {
                                const angle = (Math.PI / 3) * i;
                                const x = radius * scale * Math.cos(angle);
                                const y = radius * scale * Math.sin(angle);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="rgba(100, 116, 139, 0.5)"
                            strokeWidth="1"
                            transform="rotate(-30)"
                        />
                    ))}
                </g>
                {axisPoints.map((point, i) => (
                    <line key={i} x1={center} y1={center} x2={point.x} y2={point.y} stroke="rgba(100, 116, 139, 0.5)" strokeWidth="1" />
                ))}
                
                <polygon points={points} fill="url(#polyGradient)" stroke="#86efac" strokeWidth="2" />

                {statValues.map((value, i) => {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    const textRadius = radius * 1.15;
                    const labelRadius = radius * 1.35;
                    const x = center + textRadius * Math.cos(angle);
                    const y = center + textRadius * Math.sin(angle);
                    const labelX = center + labelRadius * Math.cos(angle);
                    const labelY = center + labelRadius * Math.sin(angle);
                    
                    return (
                        <React.Fragment key={i}>
                            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize="14" fontWeight="bold">{value}</text>
                            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="12" fontWeight="semibold">{STAT_MAP[STAT_ORDER[i]].label}</text>
                        </React.Fragment>
                    );
                })}
            </svg>
        </div>
    );
};

const TypeEffectivenessGrid: React.FC<{ effectiveness: Pokemon['typeEffectiveness'] }> = ({ effectiveness }) => {
    const multipliers = Object.entries(effectiveness)
        .filter(([, mult]) => mult !== 1)
        .sort(([, a], [, b]) => b - a);
    
    const getEffectivenessLabel = (mult: number) => {
        if (mult >= 2) return "Super effective";
        if (mult === 0.5 || mult === 0.25) return "Not very effective";
        if (mult === 0) return "No effect";
        return "";
    }
    
    const getMultiplierColor = (mult: number) => {
        if (mult >= 2) return "bg-red-500/20 text-red-300 border-red-500/50";
        if (mult === 0.5 || mult === 0.25) return "bg-sky-500/20 text-sky-300 border-sky-500/50";
        if (mult === 0) return "bg-slate-500/20 text-slate-300 border-slate-500/50";
        return "";
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {multipliers.map(([type, mult]) => (
                <div key={type} className={`p-2 rounded-lg border flex items-center gap-3 ${getMultiplierColor(mult)}`}>
                     <div className="flex-shrink-0 w-12 text-center">
                        <TypeBadge typeName={type} size="sm" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-lg">{mult}x</div>
                        <div className="text-xs opacity-80">{getEffectivenessLabel(mult)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const MovesTable: React.FC<{ attacks: Attack[] }> = ({ attacks }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-slate-600">
                    <th className="p-2">Name</th>
                    <th className="p-2 text-center">Type</th>
                    <th className="p-2 text-center">Power</th>
                </tr>
            </thead>
            <tbody>
                {attacks.map(attack => (
                    <tr key={attack.name} className="border-b border-slate-700/50">
                        <td className="p-2 capitalize font-semibold">{attack.name}</td>
                        <td className="p-2 text-center"><TypeBadge typeName={attack.type} size="sm" /></td>
                        <td className="p-2 text-center font-bold">{attack.power || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const EvolutionMap: React.FC<EvolutionMapProps> = ({ pokemonName, onBack }) => {
  const [mainPokemon, setMainPokemon] = useState<Pokemon | null>(null);
  const [evolutionLine, setEvolutionLine] = useState<Pokemon[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async (name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const [mainPokemonDetails, line] = await Promise.all([
            getPokemonDetails(name),
            getEvolutionLine(name)
        ]);
        
        if (mainPokemonDetails) {
            setMainPokemon(mainPokemonDetails);
        } else {
            setError('Could not find details for this Pokémon.');
        }

        if (line && line.length > 0) {
          setEvolutionLine(line);
        }
      } catch (err) {
        setError('Failed to fetch Pokémon data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData(pokemonName);
  }, [pokemonName]);

  const handleEvolutionClick = async (name: string) => {
      if (name !== mainPokemon?.name) {
          setIsSwitching(true);
          const details = await getPokemonDetails(name);
          if (details) {
            setMainPokemon(details);
          }
          setIsSwitching(false);
      }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <button onClick={onBack} className="mb-8 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-transform transform hover:scale-105">
        &larr; Back to Menu
      </button>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {mainPokemon && (
        <div className={`relative transition-opacity duration-300 ${isSwitching ? 'opacity-50' : 'opacity-100'}`}>
           {isSwitching && <div className="absolute inset-0 flex items-center justify-center z-10"><LoadingSpinner/></div>}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            
            <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative">
                <div className="absolute top-4 right-4 bg-slate-900/70 px-3 py-1 rounded-full text-lg font-bold text-slate-300">
                    #{String(mainPokemon.id).padStart(3, '0')}
                </div>
                <img src={mainPokemon.sprites.other['official-artwork'].front_default} alt={mainPokemon.name} className="w-full h-auto max-w-sm mx-auto" />
                 <h1 className="text-4xl md:text-5xl font-bold capitalize text-center mt-2">{mainPokemon.name}</h1>
                <div className="flex gap-2 justify-center mt-3">
                    {mainPokemon.types.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
                </div>
            </div>

            <div className="lg:col-span-3 bg-slate-800/50 rounded-2xl p-2 border border-slate-700 flex items-center justify-center">
                <StatsRadarChart stats={mainPokemon.stats} />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                <h2 className="text-2xl font-bold">Details</h2>
            </div>
            
            {evolutionLine && evolutionLine.length > 1 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-300">Evolution Line</h3>
                    <div className="flex items-center justify-center flex-wrap gap-4 md:gap-8">
                        {evolutionLine.map((pokemon, index) => (
                        <React.Fragment key={pokemon.id}>
                            <div onClick={() => handleEvolutionClick(pokemon.name)} className="cursor-pointer transition-transform transform-gpu hover:scale-105 focus:scale-105 outline-none" tabIndex={0}>
                            <div className={`p-4 rounded-xl transition-all duration-300 ${mainPokemon.id === pokemon.id ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : 'bg-slate-800/50 hover:bg-slate-700/70'}`}>
                                <img src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} alt={pokemon.name} className="w-24 h-24 md:w-32 md:h-32" />
                                <p className="text-center font-bold capitalize mt-2">{pokemon.name}</p>
                            </div>
                            </div>
                            {index < evolutionLine.length - 1 && (
                            <div className="text-4xl font-thin text-slate-500 hidden md:block">&rarr;</div>
                            )}
                        </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <h3 className="text-lg font-semibold mb-4 text-slate-300">Type Weaknesses</h3>
                     <TypeEffectivenessGrid effectiveness={mainPokemon.typeEffectiveness} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-300">Moves</h3>
                    <MovesTable attacks={mainPokemon.attacks} />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};