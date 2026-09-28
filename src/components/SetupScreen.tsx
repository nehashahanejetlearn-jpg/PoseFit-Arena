import React, { useState } from 'react';
import { Shield, Award, Flame, Zap, Play, CheckCircle2, ChevronLeft, ArrowRight, UserCheck, Activity, Info } from 'lucide-react';
import { DifficultyLevel, ExerciseId, PlayerProfile } from '../types';
import { EXERCISE_LIST } from '../utils/exercises';
import { getRankTitle, savePlayerProfile } from '../utils/storage';
import { sound } from '../utils/audio';

interface SetupScreenProps {
  playerProfile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onLaunchArena: (config: {
    exerciseId: ExerciseId;
    isCircuit: boolean;
    difficulty: DifficultyLevel;
  }) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  playerProfile,
  onUpdateProfile,
  onLaunchArena,
  onBack,
}) => {
  const [name, setName] = useState(playerProfile.name);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(playerProfile.difficulty);
  const [workoutMode, setWorkoutMode] = useState<'single' | 'circuit'>('circuit');
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseId>('squats');

  const difficulties: {
    id: DifficultyLevel;
    label: string;
    multiplier: string;
    description: string;
    badgeColor: string;
  }[] = [
    {
      id: 'cadet',
      label: 'Cadet',
      multiplier: '1.0x XP',
      description: 'Forgiving pose angle margins. Perfect for learning form.',
      badgeColor: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30',
    },
    {
      id: 'pilot',
      label: 'Pilot',
      multiplier: '1.25x XP',
      description: 'Standard athletic depth and balance thresholds.',
      badgeColor: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30',
    },
    {
      id: 'commander',
      label: 'Commander',
      multiplier: '1.5x XP',
      description: 'Strict joint angle lockouts and higher repetition goals.',
      badgeColor: 'border-purple-500/50 text-purple-400 bg-purple-950/30',
    },
    {
      id: 'galaxy_master',
      label: 'Galaxy Master',
      multiplier: '2.0x XP',
      description: 'Zero margin for error. Maximum intensity & stamina.',
      badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-950/30',
    },
  ];

  const handleSaveName = (newName: string) => {
    setName(newName);
    const updated = { ...playerProfile, name: newName };
    onUpdateProfile(updated);
    savePlayerProfile(updated);
  };

  const handleStart = () => {
    sound.playCountdown(true);
    // Update difficulty on profile
    const updated = { ...playerProfile, name, difficulty: selectedDifficulty };
    onUpdateProfile(updated);
    savePlayerProfile(updated);

    onLaunchArena({
      exerciseId: selectedExerciseId,
      isCircuit: workoutMode === 'circuit',
      difficulty: selectedDifficulty,
    });
  };

  const selectedExercise = EXERCISE_LIST.find((e) => e.id === selectedExerciseId) || EXERCISE_LIST[0];

  return (
    <div className="relative z-10 w-full min-h-[calc(100vh-65px)] px-4 py-6 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Header with back button */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-orbitron text-xs uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Bridge</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-orbitron tracking-widest text-cyan-300 uppercase">
            CHAMBER CALIBRATION
          </span>
        </div>
      </div>

      {/* Main Grid: Player Profile Card & Training Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Side: Player Identity & Career Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="hud-panel p-5 rounded-2xl glow-cyan space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <span className="text-xs font-orbitron uppercase text-cyan-300 tracking-wider">
                Pilot Dossier
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                ACTIVE
              </span>
            </div>

            {/* Editable Name Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-orbitron text-slate-400 uppercase tracking-wider block">
                Callsign / Player Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  maxLength={20}
                  onChange={(e) => handleSaveName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-sm focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                  placeholder="Enter Callsign"
                />
                <UserCheck className="w-4 h-4 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Level & Rank Status */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Classification</span>
                  <div className="text-sm font-bold text-white font-orbitron">
                    {getRankTitle(playerProfile.level)}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-600 font-orbitron font-black text-white text-base shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                  LVL {playerProfile.level}
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-rajdhani text-slate-300">
                  <span>EXP: {playerProfile.currentXp} XP</span>
                  <span>NEXT: {playerProfile.nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (playerProfile.currentXp / playerProfile.nextLevelXp) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Score</span>
                <span className="text-base font-orbitron font-bold text-cyan-300">
                  {playerProfile.totalScore.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Best Score</span>
                <span className="text-base font-orbitron font-bold text-yellow-400">
                  {playerProfile.bestScore.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Reps</span>
                <span className="text-base font-orbitron font-bold text-emerald-400">
                  {playerProfile.totalReps.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Calories Est.</span>
                <span className="text-base font-orbitron font-bold text-orange-400">
                  {playerProfile.totalCalories} kcal
                </span>
              </div>
            </div>

            {/* Completed Exercises Count */}
            <div className="pt-2 border-t border-cyan-500/20 text-xs font-rajdhani flex items-center justify-between text-slate-300">
              <span>Completed Workouts:</span>
              <span className="font-orbitron font-bold text-cyan-300">{playerProfile.totalWorkouts} Sessions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Difficulty & Exercise Mode Selection (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Difficulty Tier Selection */}
          <div className="hud-panel p-5 rounded-2xl glow-cyan space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-orbitron uppercase text-cyan-300 tracking-wider">
                  Select Intensity Tier
                </span>
              </div>
              <span className="text-[11px] font-rajdhani text-slate-400">
                Determines pose sensitivity & XP gain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {difficulties.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDifficulty(diff.id);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-orbitron font-bold text-sm text-white">{diff.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${diff.badgeColor}`}>
                        {diff.multiplier}
                      </span>
                    </div>
                    <p className="text-xs font-rajdhani text-slate-400 leading-snug">
                      {diff.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mode Selection: Full Circuit vs Targeted Exercise */}
          <div className="hud-panel p-5 rounded-2xl glow-cyan space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-orbitron uppercase text-cyan-300 tracking-wider">
                  Workout Protocol
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-cyan-500/20">
                <button
                  onClick={() => {
                    sound.playClick();
                    setWorkoutMode('circuit');
                  }}
                  className={`px-3 py-1 rounded text-xs font-orbitron transition-all ${
                    workoutMode === 'circuit'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_#06b6d4]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cosmic Circuit (All 7)
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setWorkoutMode('single');
                  }}
                  className={`px-3 py-1 rounded text-xs font-orbitron transition-all ${
                    workoutMode === 'single'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_#06b6d4]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Targeted Chamber
                </button>
              </div>
            </div>

            {workoutMode === 'circuit' ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-left">
                  <div className="inline-flex items-center gap-1.5 text-cyan-400 font-orbitron text-xs font-bold uppercase">
                    <Zap className="w-4 h-4" />
                    Full 7-Exercise Interstellar Gauntlet
                  </div>
                  <p className="text-xs font-rajdhani text-slate-300 leading-relaxed max-w-lg">
                    Sequentially cycle through Squats, Star Jumps, Cosmic Strides, Plasma Thrust, Orbital Lunges, Kinetic Curls, and Zenith Hold with rest intervals between sets.
                  </p>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <span className="text-[10px] font-mono text-cyan-400 block uppercase">Circuit Bonus</span>
                  <span className="text-lg font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                    +500 BONUS XP
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {EXERCISE_LIST.map((ex) => {
                    const isSelected = selectedExerciseId === ex.id;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedExerciseId(ex.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/60 ring-1 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[9px] font-mono text-cyan-400/70 uppercase">
                          {ex.codename.split('-')[0]}
                        </div>
                        <div className="text-xs font-orbitron font-bold text-white mt-1 leading-tight line-clamp-1">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-cyan-400 mt-2 font-mono">
                          {selectedDifficulty === 'cadet' ? ex.cadetReps :
                           selectedDifficulty === 'pilot' ? ex.pilotReps :
                           selectedDifficulty === 'commander' ? ex.commanderReps : ex.galaxyMasterReps} {ex.isTimed ? 's' : 'reps'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Exercise Details */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-orbitron font-bold text-cyan-300 block text-sm">
                      {selectedExercise.name} • {selectedExercise.category}
                    </span>
                    <p className="font-rajdhani text-slate-300 mt-0.5">
                      {selectedExercise.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      Target: {selectedDifficulty === 'cadet' ? selectedExercise.cadetReps :
                               selectedDifficulty === 'pilot' ? selectedExercise.pilotReps :
                               selectedDifficulty === 'commander' ? selectedExercise.commanderReps : selectedExercise.galaxyMasterReps} {selectedExercise.isTimed ? 'Sec Hold' : 'Reps'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Launch Action Bar */}
      <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-rajdhani text-slate-400">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Camera stream will calibrate on entry. Stand 6-8 feet away in good lighting.</span>
        </div>

        <button
          onClick={handleStart}
          className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:via-sky-300 hover:to-blue-500 text-slate-950 font-orbitron font-black text-sm md:text-base tracking-widest uppercase shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>ENGAGE ARENA SIMULATION</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
