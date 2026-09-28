import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Flame, Zap, RotateCcw, Home, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { PlayerProfile, WorkoutSessionStats } from '../types';
import { getRankTitle } from '../utils/storage';
import { sound } from '../utils/audio';

interface SummaryScreenProps {
  stats: WorkoutSessionStats;
  playerProfile: PlayerProfile;
  leveledUp: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  stats,
  playerProfile,
  leveledUp,
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    // Launch celebratory cosmic confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#c084fc', '#fde047', '#ffffff', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    if (leveledUp) {
      sound.playLevelUp();
    }
  }, [leveledUp]);

  return (
    <div className="relative z-10 w-full min-h-[calc(100vh-65px)] max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center items-center text-center">
      <div className="w-full hud-panel p-6 sm:p-8 rounded-2xl glow-cyan space-y-6">
        {/* Victory Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-orbitron uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SESSION SUMMARY • DEBRIEF COMPLETE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-orbitron font-black text-white tracking-wide">
            TRAINING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400">CONQUERED</span>
          </h1>

          <p className="text-sm font-rajdhani text-slate-300">
            Biometric telemetry stored. High-speed neural calibration successfully verified.
          </p>
        </div>

        {/* Level Up Banner if leveled up */}
        {leveledUp && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-fuchsia-950/60 via-purple-900/60 to-cyan-950/60 border border-fuchsia-500/50 flex items-center justify-between shadow-[0_0_20px_rgba(217,70,239,0.3)] animate-pulse">
            <div className="flex items-center gap-3 text-left">
              <Award className="w-8 h-8 text-fuchsia-400 shrink-0" />
              <div>
                <span className="text-xs font-orbitron font-bold text-fuchsia-300 uppercase block">
                  GALACTIC PROMOTION UNLOCKED!
                </span>
                <span className="text-sm font-rajdhani text-slate-200">
                  You advanced to <strong className="text-white">Level {playerProfile.level} [{getRankTitle(playerProfile.level)}]</strong>
                </span>
              </div>
            </div>
            <span className="text-xs font-orbitron font-bold text-yellow-400">
              NEW RANK
            </span>
          </div>
        )}

        {/* Core Stats Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Final Score</span>
            <span className="text-2xl sm:text-3xl font-orbitron font-extrabold text-cyan-300">
              {stats.totalScore.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Reps Logged</span>
            <span className="text-2xl sm:text-3xl font-orbitron font-extrabold text-emerald-400">
              {stats.completedReps}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Form Accuracy</span>
            <span className="text-2xl sm:text-3xl font-orbitron font-extrabold text-yellow-400">
              {stats.accuracyScore}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">XP Awarded</span>
            <span className="text-2xl sm:text-3xl font-orbitron font-extrabold text-fuchsia-400">
              +{stats.xpEarned}
            </span>
          </div>
        </div>

        {/* Secondary Metrics & XP Bar */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs font-rajdhani text-slate-300">
            <span>Pilot Level Progress</span>
            <span className="font-orbitron text-cyan-300 font-bold">
              Level {playerProfile.level} • {playerProfile.currentXp} / {playerProfile.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-500 transition-all duration-700"
              style={{
                width: `${Math.min(100, (playerProfile.currentXp / playerProfile.nextLevelXp) * 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Burn: ~{stats.caloriesBurned} kcal</span>
            <span>Duration: {Math.floor(stats.durationSeconds / 60)}m {stats.durationSeconds % 60}s</span>
            <span>Max Combo: x{stats.maxCombo}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRAIN AGAIN</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-yellow-500/40 bg-slate-900/60 hover:bg-yellow-950/30 hover:border-yellow-400/60 text-yellow-400 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>VIEW LEADERBOARD</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 text-cyan-300 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO BRIDGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
