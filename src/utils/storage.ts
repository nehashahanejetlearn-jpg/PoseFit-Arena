import { DifficultyLevel, GameSettings, LeaderboardEntry, PlayerProfile } from '../types';

const PROFILE_KEY = 'posefit_player_profile_v1';
const LEADERBOARD_KEY = 'posefit_leaderboard_v1';
const SETTINGS_KEY = 'posefit_settings_v1';

export const LEVEL_TITLES = [
  'Orbital Cadet',
  'Star Scout',
  'Nebula Pilot',
  'Asteroid Vanguard',
  'Cosmic Commander',
  'Solar Sentinel',
  'Pulsar Striker',
  'Hyperdrive Titan',
  'Supernova Champion',
  'Galaxy Master',
];

export function getRankTitle(level: number): string {
  const index = Math.min(Math.max(1, level) - 1, LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Astronaut One',
  level: 1,
  currentXp: 0,
  nextLevelXp: 500,
  totalScore: 0,
  bestScore: 0,
  totalWorkouts: 0,
  totalReps: 0,
  totalCalories: 0,
  completedExercises: {
    squats: 0,
    jumping_jacks: 0,
    high_knees: 0,
    overhead_press: 0,
    side_lunges: 0,
    bicep_curls: 0,
    warrior_hold: 0,
  },
  difficulty: 'pilot',
  unlockedBadges: ['first_flight'],
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  ambientHumEnabled: false,
  soundVolume: 0.8,
  mirrorCamera: true,
  skeletonColor: 'cyan',
  skeletonLineWidth: 4,
  minConfidence: 0.35,
  simulatorMode: false,
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'Commander Nova',
    exerciseName: 'Cosmic Squats',
    difficulty: 'galaxy_master',
    score: 18450,
    reps: 20,
    accuracy: 98,
    date: '2026-09-27',
  },
  {
    id: 'lead-2',
    playerName: 'Valkyrie-9',
    exerciseName: 'Star Jumps',
    difficulty: 'commander',
    score: 14200,
    reps: 30,
    accuracy: 95,
    date: '2026-09-26',
  },
  {
    id: 'lead-3',
    playerName: 'AstroEcho',
    exerciseName: 'Cosmic Strides',
    difficulty: 'pilot',
    score: 9800,
    reps: 20,
    accuracy: 92,
    date: '2026-09-25',
  },
  {
    id: 'lead-4',
    playerName: 'OrionPulse',
    exerciseName: 'Plasma Thrust',
    difficulty: 'pilot',
    score: 8400,
    reps: 12,
    accuracy: 94,
    date: '2026-09-24',
  },
  {
    id: 'lead-5',
    playerName: 'ZeroG_Ranger',
    exerciseName: 'Kinetic Curls',
    difficulty: 'cadet',
    score: 6200,
    reps: 10,
    accuracy: 96,
    date: '2026-09-23',
  },
];

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function addWorkoutXp(
  profile: PlayerProfile,
  xpEarned: number,
  scoreEarned: number,
  repsCount: number,
  caloriesBurned: number,
  exerciseId: keyof PlayerProfile['completedExercises']
): { updatedProfile: PlayerProfile; leveledUp: boolean } {
  let { level, currentXp, nextLevelXp, totalScore, bestScore, totalWorkouts, totalReps, totalCalories, completedExercises, unlockedBadges } = profile;

  currentXp += xpEarned;
  totalScore += scoreEarned;
  if (scoreEarned > bestScore) {
    bestScore = scoreEarned;
  }
  totalWorkouts += 1;
  totalReps += repsCount;
  totalCalories += Math.round(caloriesBurned);

  completedExercises = {
    ...completedExercises,
    [exerciseId]: (completedExercises[exerciseId] || 0) + 1,
  };

  let leveledUp = false;
  while (currentXp >= nextLevelXp) {
    currentXp -= nextLevelXp;
    level += 1;
    nextLevelXp = Math.round(nextLevelXp * 1.35);
    leveledUp = true;
  }

  // Award badges
  const newBadges = [...unlockedBadges];
  if (totalWorkouts >= 1 && !newBadges.includes('first_workout')) newBadges.push('first_workout');
  if (totalReps >= 50 && !newBadges.includes('century_reps')) newBadges.push('century_reps');
  if (level >= 5 && !newBadges.includes('commander_status')) newBadges.push('commander_status');

  const updatedProfile: PlayerProfile = {
    ...profile,
    level,
    currentXp,
    nextLevelXp,
    totalScore,
    bestScore,
    totalWorkouts,
    totalReps,
    totalCalories,
    completedExercises,
    unlockedBadges: newBadges,
  };

  savePlayerProfile(updatedProfile);
  return { updatedProfile, leveledUp };
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      saveLeaderboard(INITIAL_LEADERBOARD);
      return INITIAL_LEADERBOARD;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save leaderboard', err);
  }
}

export function addLeaderboardRecord(entry: Omit<LeaderboardEntry, 'id'>): void {
  const current = loadLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `lead-${Date.now()}`,
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 25);
  saveLeaderboard(updated);
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
