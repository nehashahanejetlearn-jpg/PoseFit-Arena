import React from 'react';
import { Play, HelpCircle, Trophy, Settings, ShieldCheck, Cpu, Flame, Zap, Camera, ChevronRight, Sparkles } from 'lucide-react';
import { HologramFigure } from './HologramFigure';
import { EXERCISE_LIST } from '../utils/exercises';
import { PlayerProfile } from '../types';
import { getRankTitle } from '../utils/storage';
import { sound } from '../utils/audio';

interface LandingScreenProps {
  onStartTraining: () => void;
  onOpenHowItWorks: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  playerProfile: PlayerProfile;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartTraining,
  onOpenHowItWorks,
  onOpenLeaderboard,
  onOpenSettings,
  playerProfile,
}) => {
  return (
    <div className="relative z-10 w-full min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 py-6 md:py-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2 md:mt-6">
        {/* Left Column: Hero Typography & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-orbitron tracking-widest text-cyan-300 uppercase">
              AI Space Fitness Chamber • Online
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-orbitron font-black tracking-tight text-white leading-none">
              POSEFIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400">ARENA</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-12 bg-cyan-500/60" />
              <p className="font-orbitron text-lg sm:text-xl md:text-2xl text-cyan-300 font-semibold tracking-wide">
                “Train. Move. Conquer.”
              </p>
            </div>
            <p className="text-slate-300 text-sm sm:text-base font-rajdhani font-medium max-w-xl leading-relaxed pt-2">
              Transform your physical training into an interstellar sport. Powered by client-side 
              <span className="text-cyan-400 font-bold"> MoveNet neural pose detection</span>, 
              your body movements control your ship's energy matrix and rack up high scores in real time.
            </p>
          </div>

          {/* Core Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onStartTraining();
              }}
              className="relative group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:via-sky-300 hover:to-blue-500 text-slate-950 font-orbitron font-black text-sm md:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START TRAINING</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenHowItWorks();
              }}
              className="px-5 py-4 rounded-xl border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 hover:border-cyan-400/60 text-cyan-300 font-orbitron font-bold text-xs md:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>HOW IT WORKS</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
              }}
              className="px-5 py-4 rounded-xl border border-yellow-500/30 bg-slate-900/60 hover:bg-yellow-950/30 hover:border-yellow-400/60 text-yellow-400 font-orbitron font-bold text-xs md:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>LEADERBOARD</span>
            </button>
          </div>

          {/* Privacy & Browser Camera Notice */}
          <div className="w-full max-w-xl p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md flex items-start gap-3">
            <Camera className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed font-rajdhani">
              <span className="font-bold text-cyan-300">100% PRIVATE & LOCAL: </span>
              Your camera is used in real time to detect body movement. Video processing happens locally in your browser. 
              <span className="text-slate-400"> No video or imagery is ever uploaded, recorded, or stored on servers.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hologram Mannequin & Orbital Core */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-[380px] p-6 rounded-2xl hud-panel glow-cyan">
            {/* Top HUD header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-orbitron text-cyan-300 uppercase tracking-widest">
                  TELEMETRY MATRIX
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">
                SENSOR: MOVENET-v1
              </span>
            </div>

            {/* Interactive Hologram Graphic */}
            <HologramFigure interactive={true} />

            {/* Player Pilot Card Overlay */}
            <div className="mt-2 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-rajdhani">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Pilot Identified</span>
                <span className="font-bold text-white text-sm">{playerProfile.name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Galactic Rank</span>
                <span className="font-bold text-cyan-400 text-sm">{getRankTitle(playerProfile.level)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Exercises Showcase Bar */}
      <div className="mt-12 pt-8 border-t border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-orbitron uppercase tracking-widest text-slate-300">
              7 Space Combat Conditioning Protocols
            </h2>
          </div>
          <span className="text-xs font-rajdhani text-cyan-400/80 uppercase">
            Auto Form & Angle Detection
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {EXERCISE_LIST.map((ex, idx) => (
            <div
              key={ex.id}
              onClick={() => {
                sound.playClick();
                onStartTraining();
              }}
              className="p-3 rounded-xl border border-cyan-500/20 bg-slate-900/60 hover:border-cyan-400/60 hover:bg-cyan-950/30 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-cyan-400/60 uppercase">
                  PROTO-0{idx + 1}
                </div>
                <div className="text-xs font-bold font-orbitron text-white group-hover:text-cyan-300 mt-1 line-clamp-1">
                  {ex.name}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[10px] text-slate-400 font-rajdhani">
                <span>{ex.category.split(' ')[0]}</span>
                <span className="text-cyan-400 font-bold">{ex.pilotReps} {ex.isTimed ? 'SEC' : 'REPS'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-rajdhani border-t border-cyan-500/10 pt-4 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Latency WebGL Pipeline
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline">17 Keypoint Skeletal Tracking</span>
        </div>
        <div className="text-cyan-400/70">
          POSEFIT ARENA SYSTEM • AI STUDIO REVOLUTION
        </div>
      </div>
    </div>
  );
};
