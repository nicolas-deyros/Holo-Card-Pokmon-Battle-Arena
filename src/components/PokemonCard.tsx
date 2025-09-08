import React, { useState, useRef, CSSProperties } from 'react';
import type { Pokemon, Attack } from '../types';
import { TYPE_COLORS, HOLO_TYPE_COLORS } from '../constants';

// Define a type that includes CSS custom properties, which are not in the default CSSProperties type
type CustomCSSProperties = CSSProperties & {
  [key: `--${string}`]: string | number;
};

interface PokemonCardProps {
  pokemon: Pokemon | null;
  isActive: boolean;
  isPlayer: boolean;
  onAttack?: (attack: Attack) => void;
  onRemove?: () => void;
  isFainted?: boolean;
  isHit?: boolean;
  isStatic?: boolean;
  displayMode?: 'full' | 'compact' | 'hand';
}

const TypeBadge: React.FC<{ typeName: string }> = ({ typeName }) => (
  <span
    className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${TYPE_COLORS[typeName] || 'bg-gray-500'} bg-opacity-80 backdrop-blur-sm`}
  >
    {typeName}
  </span>
);

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 z-20 bg-red-600 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold transition-transform transform hover:scale-110"
    aria-label="Remove Pokémon"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  </button>
);

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isActive,
  isPlayer: _isPlayer,
  onAttack,
  onRemove,
  isFainted,
  isHit,
  isStatic,
  displayMode = 'full',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CustomCSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isStatic) return;
    const card = cardRef.current;
    if (!card) return;

    const { clientX, clientY } = e;
    const { top, left, width, height } = card.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    const mouseX = x / width;
    const mouseY = y / height;

    const rotateX = 15 * (mouseY - 0.5);
    const rotateY = -15 * (mouseX - 0.5);

    const xPos = mouseX * 100;
    const yPos = mouseY * 100;

    setStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      '--x': `${xPos}%`,
      '--y': `${yPos}%`,
    });
  };

  const handleMouseLeave = () => {
    if (isStatic) return;
    setStyle({
      transform: 'rotateX(0deg) rotateY(0deg)',
    });
  };

  if (!pokemon) {
    return (
      <div className="w-full max-w-sm">
        <div className="w-full aspect-[63/88] bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-[5%/3.5%] flex items-center justify-center">
          <span className="text-slate-500">Waiting for Pokémon...</span>
        </div>
      </div>
    );
  }

  const hpPercentage = (pokemon.hp / pokemon.maxHp) * 100;
  const artworkUrl = pokemon.sprites.other['official-artwork'].front_default;

  const type1 = pokemon.types[0]?.type.name;
  const type2 = pokemon.types[1]?.type.name;

  const cardStyle: CustomCSSProperties = {
    ...style,
    '--poke-bg-image': artworkUrl ? `url(${artworkUrl})` : 'none',
    '--color1': type1 ? HOLO_TYPE_COLORS[type1] : '#A8A77A',
    '--color2': type2 ? HOLO_TYPE_COLORS[type2] : type1 ? HOLO_TYPE_COLORS[type1] : '#A8A77A',
  };

  return (
    <div
      className={`w-full max-w-sm card-wrapper transition-all duration-300 relative ${isActive && !isStatic ? 'scale-105' : 'scale-100'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {onRemove && <RemoveButton onClick={onRemove} />}
      <div
        ref={cardRef}
        style={cardStyle}
        className={`holo-card ${isFainted ? 'grayscale opacity-60' : ''} ${isHit ? 'animate-shake' : ''}`}
      >
        <div className="holo-card-pokemon-image" />
        <div className="holo-card-content">
          <div className="holo-card-header">
            <div>
              <h2 className="holo-card-name">{pokemon.name}</h2>
              {displayMode === 'full' && (
                <div className="type-badge-container">
                  {pokemon.types.map(t => (
                    <TypeBadge key={t.type.name} typeName={t.type.name} />
                  ))}
                </div>
              )}
            </div>
            {displayMode === 'full' && (
              <div className="holo-card-hp-info flex items-center gap-2">
                <span className="holo-card-hp-text">HP</span>
                <span className="holo-card-hp-value">
                  {pokemon.hp}/{pokemon.maxHp}
                </span>
                <progress
                  value={pokemon.hp}
                  max={pokemon.maxHp}
                  className={`flex-1 h-2 ${hpPercentage > 50 ? 'accent-green-500' : hpPercentage > 20 ? 'accent-yellow-500' : 'accent-red-600'}`}
                />
              </div>
            )}
          </div>

          {/* Bottom section for compact mode - type badges and HP info below Pokemon image */}
          {displayMode === 'compact' && (
            <div className="holo-card-bottom-info">
              <div className="type-badge-container">
                {pokemon.types.map(t => (
                  <TypeBadge key={t.type.name} typeName={t.type.name} />
                ))}
              </div>
              <div className="holo-card-hp-info flex items-center gap-2">
                <span className="holo-card-hp-text">HP</span>
                <span className="holo-card-hp-value">
                  {pokemon.hp}/{pokemon.maxHp}
                </span>
                <progress
                  value={pokemon.hp}
                  max={pokemon.maxHp}
                  className={`flex-1 h-2 ${hpPercentage > 50 ? 'accent-green-500' : hpPercentage > 20 ? 'accent-yellow-500' : 'accent-red-600'}`}
                />
              </div>
            </div>
          )}

          {displayMode === 'full' && (
            <div className="holo-card-footer">
              <div className="holo-card-attacks">
                {pokemon.attacks.map(attack => (
                  <button
                    key={attack.name}
                    onClick={() => onAttack && onAttack(attack)}
                    disabled={!onAttack || !isActive || isFainted}
                    className="holo-card-attack-btn"
                  >
                    <div className="holo-card-attack-info">
                      <span className="holo-card-attack-name">{attack.name}</span>
                      <span className="holo-card-attack-power">{attack.power}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
