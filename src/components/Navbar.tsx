import React from 'react';
import { Volume2, VolumeX, Trophy, HelpCircle, Settings, Shield, Activity } from 'lucide-react';
import { GameState, PlayerProfile } from '../types';
import { getRankTitle } from '../utils/storage';
import { sound } from '../utils/audio';

interface NavbarProps {
  gameState: GameState;
  onNavigate: (state: GameState) => void;
  playerProfile: PlayerProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameState,
  onNavigate,
  playerProfile,
  soundEnabled,
  onToggleSound,
  onOpenLeaderboard,
  onOpenHowItWorks,
  onOpenSettings,
}) => {
  return (
    <header className="relative z-30 w-full border-b border-cyan-500/20 bg-[#050b1d]/80 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigate('landing');
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center glow-cyan transition-transform group-hover:scale-105">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-lg md:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-fuchsia-400">
                POSEFIT ARENA
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-orbitron uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded">
                v2.6 AI
              </span>
            </div>
            <p className="text-[10px] font-rajdhani tracking-widest text-cyan-400/70 uppercase">
              TRAIN • MOVE • CONQUER
            </p>
          </div>
        </div>

        {/* Player Profile Quick Pill */}
        {gameState !== 'landing' && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              {playerProfile.level}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>{playerProfile.name}</span>
                <span className="text-[10px] text-fuchsia-400 uppercase font-orbitron">
                  [{getRankTitle(playerProfile.level)}]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                    style={{ width: `${Math.min(100, (playerProfile.currentXp / playerProfile.nextLevelXp) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-cyan-400/80 font-rajdhani font-semibold">
                  {playerProfile.currentXp}/{playerProfile.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/40 text-cyan-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* How It Works */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowItWorks();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/40 text-cyan-300 text-xs font-rajdhani uppercase font-bold tracking-wider transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">AI Guide</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/40 text-yellow-400 text-xs font-rajdhani uppercase font-bold tracking-wider transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Ranks</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            title="Settings"
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/40 text-cyan-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Training CTA when not in arena */}
          {gameState === 'landing' && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('setup');
              }}
              className="ml-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
