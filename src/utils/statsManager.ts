interface BattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  favoritePokemon: string[];
  pokemonEncountered: Set<string>;
  longestWinStreak: number;
  currentWinStreak: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  battlesByType: { [type: string]: number };
  achievements: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: BattleStats) => boolean;
  icon: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first battle',
    condition: stats => stats.wins >= 1,
    icon: '🏆',
  },
  {
    id: 'type_master',
    name: 'Type Master',
    description: 'Win battles with 5 different Pokémon types',
    condition: stats => Object.keys(stats.battlesByType).length >= 5,
    icon: '⚡',
  },
  {
    id: 'win_streak_5',
    name: 'Hot Streak',
    description: 'Win 5 battles in a row',
    condition: stats => stats.longestWinStreak >= 5,
    icon: '🔥',
  },
  {
    id: 'veteran_trainer',
    name: 'Veteran Trainer',
    description: 'Complete 50 battles',
    condition: stats => stats.totalBattles >= 50,
    icon: '🎖️',
  },
  {
    id: 'explorer',
    name: 'Pokémon Explorer',
    description: 'Encounter 100 different Pokémon',
    condition: stats => stats.pokemonEncountered.size >= 100,
    icon: '🗺️',
  },
];

class StatsManager {
  private static readonly STORAGE_KEY = 'pokemon-battle-stats';
  private stats: BattleStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): BattleStats {
    try {
      const saved = localStorage.getItem(StatsManager.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          pokemonEncountered: new Set(parsed.pokemonEncountered || []),
        };
      }
    } catch (error) {
      console.warn('Failed to load stats:', error);
    }

    return {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      favoritePokemon: [],
      pokemonEncountered: new Set(),
      longestWinStreak: 0,
      currentWinStreak: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      battlesByType: {},
      achievements: [],
    };
  }

  private saveStats(): void {
    try {
      const toSave = {
        ...this.stats,
        pokemonEncountered: Array.from(this.stats.pokemonEncountered),
      };
      localStorage.setItem(StatsManager.STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save stats:', error);
    }
  }

  recordBattle(
    result: 'win' | 'loss',
    playerTeam: string[],
    damageDealt: number,
    damageTaken: number
  ): string[] {
    this.stats.totalBattles++;
    this.stats.totalDamageDealt += damageDealt;
    this.stats.totalDamageTaken += damageTaken;

    // Add encountered Pokémon
    playerTeam.forEach(pokemon => this.stats.pokemonEncountered.add(pokemon));

    if (result === 'win') {
      this.stats.wins++;
      this.stats.currentWinStreak++;
      this.stats.longestWinStreak = Math.max(
        this.stats.longestWinStreak,
        this.stats.currentWinStreak
      );

      // Track battle types
      playerTeam.forEach(pokemon => {
        // You might want to fetch Pokémon type data here
        this.stats.battlesByType[pokemon] = (this.stats.battlesByType[pokemon] || 0) + 1;
      });
    } else {
      this.stats.losses++;
      this.stats.currentWinStreak = 0;
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements();

    this.saveStats();
    return newAchievements;
  }

  private checkAchievements(): string[] {
    const newAchievements: string[] = [];

    achievements.forEach(achievement => {
      if (!this.stats.achievements.includes(achievement.id) && achievement.condition(this.stats)) {
        this.stats.achievements.push(achievement.id);
        newAchievements.push(achievement.name);
      }
    });

    return newAchievements;
  }

  getStats(): BattleStats {
    return { ...this.stats };
  }

  getWinRate(): number {
    if (this.stats.totalBattles === 0) return 0;
    return (this.stats.wins / this.stats.totalBattles) * 100;
  }

  getAchievements(): Achievement[] {
    return achievements.filter(achievement => this.stats.achievements.includes(achievement.id));
  }

  getAllAchievements(): (Achievement & { unlocked: boolean })[] {
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: this.stats.achievements.includes(achievement.id),
    }));
  }

  resetStats(): void {
    this.stats = {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      favoritePokemon: [],
      pokemonEncountered: new Set(),
      longestWinStreak: 0,
      currentWinStreak: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      battlesByType: {},
      achievements: [],
    };
    this.saveStats();
  }
}

export const statsManager = new StatsManager();
export type { BattleStats, Achievement };
