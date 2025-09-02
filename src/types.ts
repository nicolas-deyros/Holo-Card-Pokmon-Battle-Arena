export interface Pokemon {
    id: number;
    name: string;
    hp: number;
    maxHp: number;
    types: { type: { name: string } }[];
    sprites: {
        front_default: string;
        other: {
            "official-artwork": {
                front_default: string;
            }
        }
    };
    attacks: Attack[];
    weaknesses: string[];
    resistances: string[];
    typeEffectiveness: { [typeName: string]: number };
    height: number;
    weight: number;
    abilities: { name: string, isHidden: boolean }[];
    stats: { name: string, value: number }[];
}

export interface Attack {
    name: string;
    power: number | null;
    type: string;
}

export interface Player {
    hand: Pokemon[];
    activePokemon: Pokemon | null;
}

export interface GameState {
    player: Player;
    computer: Player;
    turn: 'player' | 'computer' | 'gameover';
    log: string[];
    gameStatus: 'setup' | 'playing' | 'player_win' | 'computer_win';
    isProcessingTurn: boolean;
    pendingAttack?: Attack;
}

export interface PokeApiPokemon {
    id: number;
    name: string;
    stats: { base_stat: number; stat: { name: string } }[];
    types: { type: { name: string } }[];
    sprites: {
        front_default: string;
        other: {
            "official-artwork": {
                front_default: string;
            }
        }
    };
    moves: { move: { name: string; url: string } }[];
    species: { url: string };
    height: number;
    weight: number;
    abilities: { ability: { name: string }; is_hidden: boolean }[];
}

export interface PokeApiMove {
    name: string;
    power: number | null;
    type: { name: string };
}

export interface PokeApiType {
    damage_relations: {
        double_damage_from: { name: string }[];
        half_damage_from: { name: string }[];
        no_damage_from: { name:string }[];
    };
}

export interface PokeApiSpecies {
    evolution_chain: { url: string };
}

export interface PokeApiEvolutionChain {
    chain: EvolutionLink;
}

export interface EvolutionLink {
    species: { name: string; url: string };
    evolves_to: EvolutionLink[];
}