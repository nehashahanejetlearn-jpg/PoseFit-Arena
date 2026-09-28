/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CosmicBackground } from './components/CosmicBackground';
import { Navbar } from './components/Navbar';
import { LandingScreen } from './components/LandingScreen';
import { SetupScreen } from './components/SetupScreen';
import { ArenaScreen } from './components/ArenaScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  DifficultyLevel, 
  ExerciseId, 
  GameSettings, 
  GameState, 
  LeaderboardEntry, 
  PlayerProfile, 
  WorkoutSessionStats 
} from './types';
import { 
  addLeaderboardRecord, 
  addWorkoutXp, 
  loadLeaderboard, 
  loadPlayerProfile, 
  loadSettings, 
  savePlayerProfile, 
  saveSettings 
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  // Navigation & Core States
  const [gameState, setGameState] = useState<GameState>('landing');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadPlayerProfile);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);

  // Active workout parameters
  const [activeExerciseId, setActiveExerciseId] = useState<ExerciseId>('squats');
  const [isCircuitMode, setIsCircuitMode] = useState<boolean>(false);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>('pilot');
  const [latestStats, setLatestStats] = useState<WorkoutSessionStats | null>(null);
  const [didLevelUp, setDidLevelUp] = useState<boolean>(false);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Initialize sound settings on mount
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    sound.toggleAmbientHum(settings.ambientHumEnabled);
  }, [settings]);

  // Handle launching the arena from Setup Screen
  const handleLaunchArena = (config: {
    exerciseId: ExerciseId;
    isCircuit: boolean;
    difficulty: DifficultyLevel;
  }) => {
    setActiveExerciseId(config.exerciseId);
    setIsCircuitMode(config.isCircuit);
    setActiveDifficulty(config.difficulty);
    setGameState('arena');
  };

  // Handle workout completion from Arena
  const handleFinishWorkout = (stats: WorkoutSessionStats) => {
    setLatestStats(stats);

    // Save record to local leaderboard
    addLeaderboardRecord({
      playerName: playerProfile.name,
      exerciseName: stats.exerciseName,
      difficulty: activeDifficulty,
      score: stats.totalScore,
      reps: stats.completedReps,
      accuracy: stats.accuracyScore,
      date: stats.date,
    });
    setLeaderboard(loadLeaderboard());

    // Update player profile with XP & check for level up
    const { updatedProfile, leveledUp } = addWorkoutXp(
      playerProfile,
      stats.xpEarned,
      stats.totalScore,
      stats.completedReps,
      stats.caloriesBurned,
      stats.exerciseId
    );

    setPlayerProfile(updatedProfile);
    setDidLevelUp(leveledUp);
    setGameState('summary');
  };

  // Reset progress from settings
  const handleResetProgress = () => {
    localStorage.clear();
    const defaultProf = loadPlayerProfile();
    const defaultSet = loadSettings();
    setPlayerProfile(defaultProf);
    setSettings(defaultSet);
    setLeaderboard(loadLeaderboard());
    sound.playClick();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col overflow-x-hidden select-none font-chakra">
      {/* Animated Deep Space Canvas Background */}
      <CosmicBackground />

      {/* Top Sci-Fi Header */}
      <Navbar
        gameState={gameState}
        onNavigate={(targetState) => setGameState(targetState)}
        playerProfile={playerProfile}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const newMuted = !settings.soundEnabled;
          const updated = { ...settings, soundEnabled: newMuted };
          setSettings(updated);
          saveSettings(updated);
          sound.setMuted(!newMuted);
        }}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 flex flex-col justify-center items-center w-full">
        {gameState === 'landing' && (
          <LandingScreen
            onStartTraining={() => setGameState('setup')}
            onOpenHowItWorks={() => setShowHowItWorks(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenSettings={() => setShowSettings(true)}
            playerProfile={playerProfile}
          />
        )}

        {gameState === 'setup' && (
          <SetupScreen
            playerProfile={playerProfile}
            onUpdateProfile={(updated) => setPlayerProfile(updated)}
            onLaunchArena={handleLaunchArena}
            onBack={() => setGameState('landing')}
          />
        )}

        {gameState === 'arena' && (
          <ArenaScreen
            initialExerciseId={activeExerciseId}
            isCircuit={isCircuitMode}
            difficulty={activeDifficulty}
            settings={settings}
            onFinishWorkout={handleFinishWorkout}
            onExit={() => setGameState('setup')}
          />
        )}

        {gameState === 'summary' && latestStats && (
          <SummaryScreen
            stats={latestStats}
            playerProfile={playerProfile}
            leveledUp={didLevelUp}
            onPlayAgain={() => setGameState('setup')}
            onGoHome={() => setGameState('landing')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
      </main>

      {/* High Scores Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          entries={leaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Instructions & Technology Manual Modal */}
      {showHowItWorks && (
        <HowItWorksModal
          onClose={() => setShowHowItWorks(false)}
        />
      )}

      {/* System Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
