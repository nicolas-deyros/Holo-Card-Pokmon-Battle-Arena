
import React, { useEffect, useState, useRef } from 'react';
import { PokemonCard } from './PokemonCard';
import { useGameLogic } from '../hooks/useGameLogic';
import { LoadingSpinner } from './LoadingSpinner';
import { Pokeball } from './Pokeball';
import type { Pokemon, Attack } from '../types';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface BattlefieldProps {
  playerTeam: Pokemon[];
  onBack: () => void;
}

export const Battlefield: React.FC<BattlefieldProps> = ({ playerTeam, onBack }) => {
  const { gameState, handleAttack, handleSwitchPokemon } = useGameLogic(playerTeam);
  const [showIntroPokeball, setShowIntroPokeball] = useState(false);
  const [showSwitchPokeball, setShowSwitchPokeball] = useState(false);

  const [playerHit, setPlayerHit] = useState(false);
  const [computerHit, setComputerHit] = useState(false);

  const prevPlayerPokemon = usePrevious(gameState.player.activePokemon);
  const prevComputerPokemon = usePrevious(gameState.computer.activePokemon);
  const prevPlayerHp = usePrevious(gameState.player.activePokemon?.hp);
  const prevComputerHp = usePrevious(gameState.computer.activePokemon?.hp);
  
  useEffect(() => {
      const currentPlayerHp = gameState.player.activePokemon?.hp;
      if (typeof prevPlayerHp === 'number' && typeof currentPlayerHp === 'number' && currentPlayerHp < prevPlayerHp) {
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 400);
      }
  }, [gameState.player.activePokemon?.hp, prevPlayerHp]);

  useEffect(() => {
      const currentComputerHp = gameState.computer.activePokemon?.hp;
      if (typeof prevComputerHp === 'number' && typeof currentComputerHp === 'number' && currentComputerHp < prevComputerHp) {
          setComputerHit(true);
          setTimeout(() => setComputerHit(false), 400);
      }
  }, [gameState.computer.activePokemon?.hp, prevComputerHp]);

  useEffect(() => {
    if (gameState.gameStatus === 'setup') {
      setShowIntroPokeball(true);
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (prevPlayerPokemon && prevPlayerPokemon.hp === 0 && gameState.player.activePokemon?.id !== prevPlayerPokemon.id) {
        setShowSwitchPokeball(true);
    }
  }, [gameState.player.activePokemon, prevPlayerPokemon]);

  useEffect(() => {
    if (prevComputerPokemon && prevComputerPokemon.hp === 0 && gameState.computer.activePokemon?.id !== prevComputerPokemon.id) {
        setShowSwitchPokeball(true);
    }
  }, [gameState.computer.activePokemon, prevComputerPokemon]);


  if (gameState.gameStatus === 'setup' && !showIntroPokeball) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-xl">Preparing computer opponent...</p>
      </div>
    );
  }
  
  const renderGameOver = () => (
    <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center text-center animate-fade-in">
        <h2 className="text-7xl font-black mb-4">{gameState.gameStatus === 'player_win' ? 'You Win!' : 'You Lose!'}</h2>
        <p className="text-2xl mb-8">{gameState.gameStatus === 'player_win' ? 'Congratulations, Champion!' : 'Better luck next time.'}</p>
        <button onClick={onBack} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-full transition-transform transform hover:scale-105">
            Back to Menu
        </button>
    </div>
  );

  return (
    <div className="min-h-screen p-4 flex flex-col items-center relative overflow-hidden">
        {showIntroPokeball && <Pokeball onAnimationEnd={() => setShowIntroPokeball(false)} />}
        {showSwitchPokeball && <Pokeball onAnimationEnd={() => setShowSwitchPokeball(false)} />}
        {(gameState.gameStatus === 'player_win' || gameState.gameStatus === 'computer_win') && renderGameOver()}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-yellow-300 mb-4" style={{ textShadow: '2px 2px 4px #000000' }}>Pokémon Battle</h1>

        <div className="w-full flex-grow flex flex-col md:flex-row-reverse items-center justify-center md:justify-evenly gap-4 md:gap-8 px-4">
            {/* Opponent's Side */}
            <div className="w-full max-w-xs md:max-w-sm flex flex-col items-center">
                <PokemonCard 
                    pokemon={gameState.computer.activePokemon} 
                    isActive={gameState.turn === 'computer'} 
                    isPlayer={false} 
                    isFainted={gameState.computer.activePokemon?.hp === 0}
                    isHit={computerHit}
                />
                 <div className="flex gap-2 mt-2 h-10">
                    {gameState.computer.hand.map(p => <div key={p.id} className="w-10 h-10 bg-slate-900/70 rounded-full p-1 flex items-center justify-center shadow-inner"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="pokeball" className="w-8 h-8"/></div>)}
                </div>
            </div>

            {/* VS Separator */}
            <div className="text-4xl md:text-6xl font-black text-yellow-400 my-2 md:my-0 z-10" style={{ textShadow: '3px 3px 6px #000' }}>
                VS
            </div>
            
            {/* Player's Side */}
            <div className="w-full max-w-xs md:max-w-sm flex flex-col items-center">
                <PokemonCard 
                    pokemon={gameState.player.activePokemon} 
                    isActive={gameState.turn === 'player'} 
                    isPlayer={true}
                    onAttack={(attack: Attack) => handleAttack(attack)}
                    isFainted={gameState.player.activePokemon?.hp === 0}
                    isHit={playerHit}
                />
            </div>
        </div>
        
        {/* Bottom Panel: Your Hand + Battle Log */}
        <div className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Your Hand */}
            <div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-4 text-center">Your Hand</h2>
                {gameState.player.activePokemon?.hp === 0 && gameState.gameStatus === 'playing' && (
                    <div className="my-2 text-yellow-400 font-bold text-lg text-center animate-pulse">Your Pokémon fainted! Choose another one from your hand.</div>
                )}
                <div className="flex justify-center items-end gap-4 min-h-[14rem]">
                    {gameState.player.hand.map(p => {
                        const isDisabled = gameState.turn !== 'player' || gameState.isProcessingTurn || p.hp === 0;
                        return (
                            <div 
                                key={p.id} 
                                onClick={() => !isDisabled && handleSwitchPokemon(p.id)}
                                className={`w-40 transition-transform duration-300 ${!isDisabled ? 'hover:-translate-y-2 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                            >
                                <PokemonCard
                                    pokemon={p}
                                    isActive={false}
                                    isPlayer={true}
                                    isFainted={p.hp === 0}
                                    isStatic={true}
                                    displayMode="hand"
                                />
                            </div>
                        );
                    })}
                    {gameState.player.hand.length === 0 && <p className="text-slate-400 self-center">No other Pokémon available.</p>}
                </div>
            </div>

            {/* Battle Log */}
            <div className="w-full">
                <h2 className="text-2xl font-bold text-yellow-300 mb-4 text-center">Battle Log</h2>
                <div className="w-full h-[18rem] bg-slate-900/70 rounded-xl border-2 border-slate-700 p-2 overflow-y-auto">
                    <ul className="text-sm text-left font-semibold">
                        {gameState.log.slice().reverse().map((entry, i) => <li key={i} className="px-2 py-1 border-b border-slate-700/50 last:border-b-0"><span className="font-bold text-slate-400 mr-2">{gameState.log.length - i}.</span>{entry}</li>)}
                    </ul>
                </div>
            </div>
        </div>

    </div>
  );
};
