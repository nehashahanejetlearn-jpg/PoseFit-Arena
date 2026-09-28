export type DifficultyLevel = 'cadet' | 'pilot' | 'commander' | 'galaxy_master';

export type GameState = 'landing' | 'setup' | 'arena' | 'summary';

export type ExerciseId = 
  | 'squats'
  | 'jumping_jacks'
  | 'high_knees'
  | 'overhead_press'
  | 'side_lunges'
  | 'bicep_curls'
  | 'warrior_hold';

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  codename: string;
  category: string;
  targetMuscles: string[];
  description: string;
  formTips: string[];
  cadetReps: number;
  pilotReps: number;
  commanderReps: number;
  galaxyMasterReps: number;
  isTimed?: boolean; // e.g. hold for 20s
  durationSeconds?: number;
  caloriesPerRep: number;
  iconName: string;
  primaryKeypoints: string[];
}

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export interface FormFeedback {
  status: 'correct' | 'adjust' | 'incorrect';
  message: string;
  currentAngle?: number;
  targetAngle?: number;
  progressPercentage: number; // 0 - 100% of current rep
  inActivePhase: boolean;
}

export interface WorkoutSessionStats {
  exerciseId: ExerciseId;
  exerciseName: string;
  targetReps: number;
  completedReps: number;
  validReps: number;
  accuracyScore: number; // 0 - 100
  totalScore: number;
  maxCombo: number;
  xpEarned: number;
  caloriesBurned: number;
  durationSeconds: number;
  date: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalScore: number;
  bestScore: number;
  totalWorkouts: number;
  totalReps: number;
  totalCalories: number;
  completedExercises: Record<ExerciseId, number>;
  difficulty: DifficultyLevel;
  unlockedBadges: string[];
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  exerciseName: string;
  difficulty: DifficultyLevel;
  score: number;
  reps: number;
  accuracy: number;
  date: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  ambientHumEnabled: boolean;
  soundVolume: number;
  mirrorCamera: boolean;
  skeletonColor: 'cyan' | 'magenta' | 'emerald' | 'amber';
  skeletonLineWidth: number;
  minConfidence: number;
  simulatorMode: boolean;
}
