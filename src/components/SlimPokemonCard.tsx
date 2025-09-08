import React from 'react';

interface SlimPokemonCardProps {
  title: string;
  pokemonName: string;
  description?: string;
  onClick?: () => void;
  isCurrentPokemon?: boolean;
}

export const SlimPokemonCard: React.FC<SlimPokemonCardProps> = ({
  title,
  pokemonName,
  description,
  onClick,
  isCurrentPokemon = false,
}) => {
  return (
    <div
      className={`flex gap-3 items-center rounded-lg p-3 h-16 transition-all duration-200 cursor-pointer ${
        isCurrentPokemon
          ? 'bg-yellow-600/20 border-2 border-yellow-400'
          : 'bg-slate-800/50 hover:bg-slate-700/50 border-2 border-slate-600'
      }`}
      onClick={onClick}
    >
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonName}.png`}
        alt={pokemonName}
        className="w-10 h-10 object-contain"
        loading="lazy"
      />
      <div className="overflow-hidden leading-none flex-1">
        <div className="truncate font-medium text-white capitalize">{title}</div>
        {description && <div className="text-sm text-slate-400 truncate mt-1">{description}</div>}
      </div>
    </div>
  );
};
