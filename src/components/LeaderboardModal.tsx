import React, { useState } from 'react';
import { X, Trophy, Medal, Filter, Calendar } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ entries, onClose }) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredEntries = entries.filter((e) => {
    if (filterDifficulty === 'all') return true;
    return e.difficulty === filterDifficulty;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel w-full max-w-2xl p-6 rounded-2xl glow-cyan space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-orbitron font-black text-lg text-white tracking-wide">
              GALACTIC HALL OF FAME
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-rajdhani">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter by Intensity:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-cyan-500/20">
            {['all', 'cadet', 'pilot', 'commander', 'galaxy_master'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  sound.playClick();
                  setFilterDifficulty(lvl);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-orbitron uppercase tracking-wider transition-all ${
                  filterDifficulty === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'all' ? 'All Tiers' : lvl.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Entries */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-rajdhani text-sm">
              No flight records found for this tier. Complete a workout to claim the top rank!
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isTop3 = idx < 3;
              const medalColor = 
                idx === 0 ? 'text-yellow-400' :
                idx === 1 ? 'text-slate-300' :
                idx === 2 ? 'text-amber-600' : 'text-slate-500';

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-yellow-950/30 to-cyan-950/20 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      : 'bg-slate-950/60 border-cyan-500/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-orbitron font-bold text-xs ${medalColor}`}>
                      {isTop3 ? <Medal className="w-4 h-4 fill-current" /> : `#${idx + 1}`}
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-white text-sm">
                        {entry.playerName}
                      </div>
                      <div className="text-[11px] font-rajdhani text-cyan-400/80">
                        {entry.exerciseName} • <span className="uppercase text-slate-400">{entry.difficulty.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-orbitron font-extrabold text-cyan-300 text-sm">
                      {entry.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {entry.reps} Reps • {entry.accuracy}% Acc
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/20 pt-3 text-right">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-orbitron text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
