import type {
  Pokemon,
  Attack,
  PokeApiPokemon,
  PokeApiMove,
  PokeApiType,
  PokeApiSpecies,
  PokeApiEvolutionChain,
  EvolutionLink,
} from '../types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const apiCache = new Map<string, unknown>();

async function cachedFetch<T>(url: string): Promise<T> {
  if (apiCache.has(url)) {
    return apiCache.get(url) as T;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText} for ${url}`);
    }
    const data = await response.json();
    apiCache.set(url, data);
    return data as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export async function getAllPokemonNames(): Promise<{ name: string }[]> {
  const data = await cachedFetch<{ results: { name: string }[] }>(
    `${POKEAPI_BASE_URL}/pokemon?limit=1302`
  );
  return data.results;
}

async function getMoveDetails(moveUrl: string): Promise<Attack | null> {
  const moveData = await cachedFetch<PokeApiMove>(moveUrl);
  if (moveData.power !== null && moveData.power > 0) {
    return {
      name: moveData.name.replace(/-/g, ' '),
      power: moveData.power,
      type: moveData.type.name,
    };
  }
  return null;
}

export async function getTypeRelations(
  typeName: string
): Promise<{ weaknesses: string[]; resistances: string[] }> {
  const typeData = await cachedFetch<PokeApiType>(`${POKEAPI_BASE_URL}/type/${typeName}`);
  return {
    weaknesses: typeData.damage_relations.double_damage_from.map(t => t.name),
    resistances: typeData.damage_relations.half_damage_from
      .map(t => t.name)
      .concat(typeData.damage_relations.no_damage_from.map(t => t.name)),
  };
}

export async function getPokemonDetails(nameOrId: string | number): Promise<Pokemon | null> {
  try {
    const pokemonData = await cachedFetch<PokeApiPokemon>(
      `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`
    );

    const hpStat = pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 30;
    const maxHp = Math.floor(hpStat * 2.5) + 50;

    const movePromises = pokemonData.moves
      .slice(0, 20) // Limit to first 20 moves to avoid too many API calls
      .map(m => getMoveDetails(m.move.url));

    const moves = (await Promise.all(movePromises))
      .filter((m): m is Attack => m !== null)
      .sort(() => 0.5 - Math.random()) // Shuffle moves
      .slice(0, 4); // Take 4 random damaging moves

    // Calculate detailed type effectiveness
    const allTypeNames = (
      await cachedFetch<{ results: { name: string }[] }>(`${POKEAPI_BASE_URL}/type`)
    ).results
      .map(r => r.name)
      .filter(n => n !== 'unknown' && n !== 'shadow');
    const typeEffectiveness: { [key: string]: number } = {};
    allTypeNames.forEach(t => (typeEffectiveness[t] = 1));

    for (const typeInfo of pokemonData.types) {
      const typeData = await cachedFetch<PokeApiType>(
        `${POKEAPI_BASE_URL}/type/${typeInfo.type.name}`
      );
      typeData.damage_relations.double_damage_from.forEach(t => {
        if (typeEffectiveness[t.name] !== undefined) typeEffectiveness[t.name] *= 2;
      });
      typeData.damage_relations.half_damage_from.forEach(t => {
        if (typeEffectiveness[t.name] !== undefined) typeEffectiveness[t.name] *= 0.5;
      });
      typeData.damage_relations.no_damage_from.forEach(t => {
        if (typeEffectiveness[t.name] !== undefined) typeEffectiveness[t.name] = 0;
      });
    }

    const allWeaknesses = Object.entries(typeEffectiveness)
      .filter(([, mult]) => mult >= 2)
      .map(([type]) => type);
    const allResistances = Object.entries(typeEffectiveness)
      .filter(([, mult]) => mult < 1)
      .map(([type]) => type);

    return {
      id: pokemonData.id,
      name: pokemonData.name,
      hp: maxHp,
      maxHp: maxHp,
      types: pokemonData.types,
      sprites: pokemonData.sprites,
      attacks: moves.length > 0 ? moves : [{ name: 'Struggle', power: 50, type: 'normal' }],
      weaknesses: allWeaknesses,
      resistances: allResistances,
      typeEffectiveness,
      height: pokemonData.height,
      weight: pokemonData.weight,
      abilities: pokemonData.abilities.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
      stats: pokemonData.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
    };
  } catch (error) {
    console.error(`Failed to get details for Pokémon ${nameOrId}:`, error);
    return null;
  }
}

async function parseEvolutionChain(chain: EvolutionLink): Promise<Pokemon[]> {
  const evolutionLine: Pokemon[] = [];
  let current = chain;

  while (current) {
    const details = await getPokemonDetails(current.species.name);
    if (details) {
      evolutionLine.push(details);
    }
    if (current.evolves_to.length > 0) {
      current = current.evolves_to[0];
    } else {
      break;
    }
  }
  return evolutionLine;
}

export async function getEvolutionLine(pokemonName: string): Promise<Pokemon[] | null> {
  try {
    const speciesData = await cachedFetch<PokeApiSpecies>(
      `${POKEAPI_BASE_URL}/pokemon-species/${pokemonName}`
    );
    const evolutionChainData = await cachedFetch<PokeApiEvolutionChain>(
      speciesData.evolution_chain.url
    );
    return parseEvolutionChain(evolutionChainData.chain);
  } catch (error) {
    console.error(`Failed to get evolution line for ${pokemonName}:`, error);
    return null;
  }
}

/**
 * Fetch a small set of related Pokémon that share a given type. Excludes the provided Pokémon name.
 * Limits the number of API calls by sampling a subset and fetching details for only a few.
 */
export async function getRelatedPokemonByType(
  typeName: string,
  options?: { limit?: number; excludeName?: string }
): Promise<Pokemon[]> {
  const limit = options?.limit ?? 6;
  const excludeName = options?.excludeName?.toLowerCase();

  try {
    // PokeAPI type endpoint includes a list of Pokémon for that type
    const typeData = await cachedFetch<{
      pokemon: { pokemon: { name: string; url: string } }[];
    }>(`${POKEAPI_BASE_URL}/type/${typeName}`);

    const names = typeData.pokemon.map(p => p.pokemon.name).filter(name => name !== excludeName);

    // Shuffle and take a small sample to limit API calls
    const sampled = names.sort(() => 0.5 - Math.random()).slice(0, limit * 2);
    const details = await Promise.all(sampled.map(n => getPokemonDetails(n).catch(() => null)));

    // Filter nulls, de-duplicate by id, and cap to limit
    const uniqueById = new Map<number, Pokemon>();
    for (const p of details) {
      if (p) uniqueById.set(p.id, p);
      if (uniqueById.size >= limit) break;
    }
    return Array.from(uniqueById.values());
  } catch (error) {
    console.error(`Failed to get related Pokémon for type ${typeName}:`, error);
    return [];
  }
}
