import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Pokemon, Attack } from '../types';
import { getPokemonDetails, getTypeRelations } from '../services/pokeapi';
import { TEAM_SIZE } from '../constants';

// A simple, deterministic "AI" to choose the best move.
async function getComputerMove(computerPokemon: Pokemon, playerPokemon: Pokemon): Promise<Attack> {
  // If there's no pokemon or it has no attacks, return a default move.
  if (!computerPokemon || !playerPokemon || computerPokemon.attacks.length === 0) {
    return { name: 'Struggle', power: 50, type: 'normal' };
  }

  const { attacks } = computerPokemon;
  const { weaknesses, resistances } = playerPokemon;

  // 1. Find super-effective attacks
  const superEffectiveAttacks = attacks.filter(attack => weaknesses.includes(attack.type));
  if (superEffectiveAttacks.length > 0) {
    // Sort by power and return the strongest one
    superEffectiveAttacks.sort((a, b) => (b.power || 0) - (a.power || 0));
    return superEffectiveAttacks[0];
  }

  // 2. Find neutral-damage attacks (not resisted)
  const neutralAttacks = attacks.filter(attack => !resistances.includes(attack.type));
  if (neutralAttacks.length > 0) {
    // Sort by power and return the strongest one
    neutralAttacks.sort((a, b) => (b.power || 0) - (a.power || 0));
    return neutralAttacks[0];
  }

  // 3. If all attacks are resisted, just use the strongest one available.
  // This also serves as a fallback for any other case.
  const allAttacksSorted = [...attacks].sort((a, b) => (b.power || 0) - (a.power || 0));
  return allAttacksSorted[0];
}

type GameAction =
  | {
      type: 'START_SUCCESS';
      payload: { playerTeam: Pokemon[]; computerTeam: Pokemon[] };
    }
  | { type: 'ATTACK'; payload: { attack: Attack } }
  | {
      type: 'PROCESS_TURN';
      payload: {
        damage: number;
        log: string;
        isSuperEffective: boolean;
        isResisted: boolean;
      };
    }
  | { type: 'SWITCH_POKEMON'; payload: { pokemonId: number } }
  | { type: 'FAINT_SWITCH'; payload: { nextComputerPokemon?: Pokemon } }
  | { type: 'END_TURN' }
  | { type: 'GAME_OVER'; payload: { winner: 'player' | 'computer' } };

const initialState: GameState = {
  player: { hand: [], activePokemon: null },
  computer: { hand: [], activePokemon: null },
  turn: 'player',
  log: [],
  gameStatus: 'setup',
  isProcessingTurn: false,
  pendingAttack: undefined,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SUCCESS':
      return {
        ...initialState,
        player: {
          hand: action.payload.playerTeam.slice(1),
          activePokemon: action.payload.playerTeam[0],
        },
        computer: {
          hand: action.payload.computerTeam.slice(1),
          activePokemon: action.payload.computerTeam[0],
        },
        gameStatus: 'playing',
        log: [
          `Battle between ${action.payload.playerTeam[0].name} and ${action.payload.computerTeam[0].name} starts!`,
        ],
      };

    case 'ATTACK': {
      const attackerName =
        state.turn === 'player'
          ? state.player.activePokemon?.name
          : state.computer.activePokemon?.name;
      const attackerIdentifier = state.turn === 'player' ? 'Player' : 'Computer';
      return {
        ...state,
        isProcessingTurn: true,
        pendingAttack: action.payload.attack,
        log: [
          ...state.log,
          `${attackerIdentifier}'s ${attackerName} used ${action.payload.attack.name}!`,
        ],
      };
    }

    case 'PROCESS_TURN': {
      const { damage, isSuperEffective, isResisted } = action.payload;
      const newLog = [...state.log];
      if (isSuperEffective) newLog.push("It's super effective!");
      if (isResisted) newLog.push("It's not very effective...");

      if (state.turn === 'player') {
        const newHp = Math.max(0, (state.computer.activePokemon?.hp || 0) - damage);
        return {
          ...state,
          computer: {
            ...state.computer,
            activePokemon: { ...state.computer.activePokemon!, hp: newHp },
          },
          log: newLog,
        };
      } else {
        // computer's turn
        const newHp = Math.max(0, (state.player.activePokemon?.hp || 0) - damage);
        return {
          ...state,
          player: {
            ...state.player,
            activePokemon: { ...state.player.activePokemon!, hp: newHp },
          },
          log: newLog,
        };
      }
    }

    case 'FAINT_SWITCH': {
      if (state.turn === 'player') {
        // Computer fainted
        const logMessage = `Computer's ${state.computer.activePokemon?.name} fainted!`;
        if (action.payload.nextComputerPokemon) {
          return {
            ...state,
            computer: {
              ...state.computer,
              activePokemon: action.payload.nextComputerPokemon,
              hand: state.computer.hand.filter(
                p => p.id !== action.payload.nextComputerPokemon!.id
              ),
            },
            log: [
              ...state.log,
              logMessage,
              `Computer sends out ${action.payload.nextComputerPokemon.name}!`,
            ],
            isProcessingTurn: false,
            pendingAttack: undefined,
          };
        }
        return {
          ...state,
          log: [...state.log, logMessage],
          isProcessingTurn: false,
          pendingAttack: undefined,
        };
      } else {
        // Player fainted
        return {
          ...state,
          turn: 'player',
          log: [...state.log, `Player's ${state.player.activePokemon?.name} fainted!`],
          isProcessingTurn: false,
          pendingAttack: undefined,
        };
      }
    }

    case 'SWITCH_POKEMON': {
      const newActive = state.player.hand.find(p => p.id === action.payload.pokemonId);
      if (!newActive || newActive.hp === 0) return state;

      const isForcedSwitch = state.player.activePokemon?.hp === 0;
      const newHand = state.player.hand.filter(p => p.id !== action.payload.pokemonId);

      if (state.player.activePokemon && state.player.activePokemon.hp > 0) {
        newHand.push(state.player.activePokemon);
      }

      // If it's a voluntary switch, it costs the player's turn. We start processing, and an effect will end the turn.
      // If it's a forced switch, the player stays in control and can act immediately.
      return {
        ...state,
        player: { activePokemon: newActive, hand: newHand },
        log: [...state.log, `Player: Go, ${newActive.name}!`],
        isProcessingTurn: !isForcedSwitch,
        pendingAttack: undefined,
      };
    }

    case 'END_TURN': {
      const nextTurn = state.turn === 'player' ? 'computer' : 'player';
      return {
        ...state,
        turn: nextTurn,
        isProcessingTurn: false,
        pendingAttack: undefined,
      };
    }

    case 'GAME_OVER':
      return {
        ...state,
        turn: 'gameover',
        gameStatus: action.payload.winner === 'player' ? 'player_win' : 'computer_win',
        log: [
          ...state.log,
          `All of ${action.payload.winner === 'player' ? 'the Computer' : 'the Player'}'s Pokémon have fainted!`,
        ],
      };

    default:
      return state;
  }
}

async function calculateDamage(attack: Attack, _attacker: Pokemon, defender: Pokemon) {
  const damage = attack.power || 20;
  let multiplier = 1.0;

  for (const defType of defender.types) {
    const typeRelations = await getTypeRelations(defType.type.name);
    if (typeRelations.weaknesses.includes(attack.type)) {
      multiplier *= 2;
    }
    if (typeRelations.resistances.includes(attack.type)) {
      multiplier *= 0.5;
    }
  }

  const isSuperEffective = multiplier > 1;
  const isResisted = multiplier < 1;

  return {
    damage: Math.floor(damage * multiplier),
    isSuperEffective,
    isResisted,
  };
}

export const useGameLogic = (playerTeam: Pokemon[]) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initial team setup with cleanup
  useEffect(() => {
    let isSubscribed = true;
    if (gameState.gameStatus === 'setup' && playerTeam.length > 0) {
      const fetchComputerTeam = async () => {
        try {
          const computerPromises = [];
          for (let i = 0; i < TEAM_SIZE; i++) {
            computerPromises.push(getPokemonDetails(Math.floor(Math.random() * 898) + 1));
          }
          const computerTeam = (await Promise.all(computerPromises)).filter(
            (p): p is Pokemon => p !== null
          );

          if (
            isSubscribed &&
            playerTeam.length === TEAM_SIZE &&
            computerTeam.length === TEAM_SIZE
          ) {
            const allPokemon = [...playerTeam, ...computerTeam];
            const allTypes = new Set<string>();
            allPokemon.forEach(p => p.types.forEach(t => allTypes.add(t.type.name)));
            // Pre-warm the type relations cache for smoother battles
            await Promise.all(Array.from(allTypes).map(t => getTypeRelations(t)));

            dispatch({
              type: 'START_SUCCESS',
              payload: { playerTeam, computerTeam },
            });
          }
        } catch (e) {
          console.error('Failed to set up computer team', e);
        }
      };
      fetchComputerTeam();
    }
    return () => {
      isSubscribed = false;
    };
  }, [playerTeam, gameState.gameStatus]);

  // Effect for processing a pending attack
  useEffect(() => {
    let isSubscribed = true;
    let turnTimer: number;

    const processTurn = async () => {
      if (gameState.isProcessingTurn && gameState.pendingAttack) {
        const { player, computer, turn, pendingAttack } = gameState;
        const attacker = turn === 'player' ? player.activePokemon : computer.activePokemon;
        const defender = turn === 'player' ? computer.activePokemon : player.activePokemon;
        if (!attacker || !defender) return;

        const { damage, isSuperEffective, isResisted } = await calculateDamage(
          pendingAttack,
          attacker,
          defender
        );

        if (!isSubscribed) return;
        dispatch({
          type: 'PROCESS_TURN',
          payload: { damage, log: '', isSuperEffective, isResisted },
        });

        turnTimer = window.setTimeout(() => {
          if (!isSubscribed) return;

          const currentGameState = gameStateRef.current;
          const attackerIsPlayer = currentGameState.turn === 'player';
          const defenderAfterDamage = attackerIsPlayer
            ? currentGameState.computer.activePokemon
            : currentGameState.player.activePokemon;

          if (defenderAfterDamage && defenderAfterDamage.hp <= 0) {
            if (attackerIsPlayer) {
              const nextPokemon = currentGameState.computer.hand.find(p => p.hp > 0);
              if (nextPokemon) {
                dispatch({
                  type: 'FAINT_SWITCH',
                  payload: { nextComputerPokemon: nextPokemon },
                });
              } else {
                dispatch({ type: 'GAME_OVER', payload: { winner: 'player' } });
              }
            } else {
              if (currentGameState.player.hand.some(p => p.hp > 0)) {
                dispatch({ type: 'FAINT_SWITCH', payload: {} });
              } else {
                dispatch({ type: 'GAME_OVER', payload: { winner: 'computer' } });
              }
            }
          } else {
            dispatch({ type: 'END_TURN' });
          }
        }, 1500);
      }
    };

    processTurn();

    return () => {
      isSubscribed = false;
      clearTimeout(turnTimer);
    };
  }, [gameState.isProcessingTurn, gameState.pendingAttack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect for handling turn end after a voluntary switch
  useEffect(() => {
    let switchTimer: number;
    const { isProcessingTurn, pendingAttack, turn, log } = gameState;

    // This effect runs when processing is active, there is no pending attack, and it's the player's turn.
    // This signals a voluntary switch has just happened.
    if (isProcessingTurn && !pendingAttack && turn === 'player') {
      const lastLogEntry = log[log.length - 1] || '';
      if (lastLogEntry.startsWith('Player: Go,')) {
        switchTimer = window.setTimeout(() => {
          dispatch({ type: 'END_TURN' });
        }, 500); // A small delay to make the switch feel deliberate
      }
    }
    return () => {
      clearTimeout(switchTimer);
    };
  }, [gameState.isProcessingTurn, gameState.pendingAttack, gameState.turn, gameState.log]);

  // Effect for computer's turn logic
  useEffect(() => {
    let isSubscribed = true;
    let computerActionTimer: number;

    const computerTurn = async () => {
      const { computer, player } = gameStateRef.current;
      const activeComputerPokemon = computer.activePokemon;
      const activePlayerPokemon = player.activePokemon;
      if (!activeComputerPokemon || !activePlayerPokemon || !isSubscribed) return;

      const attackToUse = await getComputerMove(activeComputerPokemon, activePlayerPokemon);

      if (isSubscribed) {
        dispatch({ type: 'ATTACK', payload: { attack: attackToUse } });
      }
    };

    if (
      gameState.turn === 'computer' &&
      !gameState.isProcessingTurn &&
      gameState.gameStatus === 'playing'
    ) {
      computerActionTimer = window.setTimeout(computerTurn, 1200); // Delay before computer acts
    }

    return () => {
      isSubscribed = false;
      clearTimeout(computerActionTimer);
    };
  }, [gameState.turn, gameState.isProcessingTurn, gameState.gameStatus]);

  const handleAttack = useCallback(
    (attack: Attack) => {
      if (
        gameState.turn !== 'player' ||
        gameState.isProcessingTurn ||
        gameState.player.activePokemon?.hp === 0
      )
        return;
      dispatch({ type: 'ATTACK', payload: { attack } });
    },
    [gameState.turn, gameState.isProcessingTurn, gameState.player.activePokemon?.hp]
  );

  const handleSwitchPokemon = useCallback(
    (pokemonId: number) => {
      if (gameState.isProcessingTurn && gameState.player.activePokemon?.hp !== 0) return;
      if (gameState.turn !== 'player' && gameState.player.activePokemon?.hp !== 0) return;
      if (gameState.player.activePokemon?.id === pokemonId) return;

      dispatch({ type: 'SWITCH_POKEMON', payload: { pokemonId } });
    },
    [gameState.turn, gameState.isProcessingTurn, gameState.player.activePokemon]
  );

  return { gameState, handleAttack, handleSwitchPokemon };
};
