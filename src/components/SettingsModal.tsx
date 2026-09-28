import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Eye, Shield, Sliders, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types';
import { saveSettings } from '../utils/storage';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const updateField = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    saveSettings(updated);

    if (key === 'soundEnabled') {
      sound.setMuted(!value);
    }
    if (key === 'soundVolume') {
      sound.setVolume(value as number);
    }
    if (key === 'ambientHumEnabled') {
      sound.toggleAmbientHum(value as boolean);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel w-full max-w-xl p-6 rounded-2xl glow-cyan space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-black text-lg text-white tracking-wide">
              SYSTEM CONFIGURATION
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

        {/* Scrollable Settings Options */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-rajdhani text-slate-300">
          {/* Audio Section */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-3">
            <span className="font-orbitron font-bold text-cyan-300 block text-xs uppercase tracking-wider">
              Audio Telemetry
            </span>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Synthesizer Sound Effects</span>
                <span className="text-slate-400 text-[11px]">Rep chimes, form alerts, level-up fanfare</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => updateField('soundEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="font-bold text-white">Audio Volume</span>
                <span className="font-mono text-cyan-400">{Math.round(localSettings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={localSettings.soundVolume}
                onChange={(e) => updateField('soundVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10">
              <div>
                <span className="font-bold text-white block">Ambient Space Drone</span>
                <span className="text-slate-400 text-[11px]">Atmospheric sci-fi spaceship engine hum</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.ambientHumEnabled}
                onChange={(e) => updateField('ambientHumEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Camera & Detection Section */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-3">
            <span className="font-orbitron font-bold text-cyan-300 block text-xs uppercase tracking-wider">
              Camera & Skeleton Tracking
            </span>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Mirror Camera Stream</span>
                <span className="text-slate-400 text-[11px]">Flip horizontal video like a mirror</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.mirrorCamera}
                onChange={(e) => updateField('mirrorCamera', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-white">Skeleton Line Width</span>
                <span className="font-mono text-cyan-400">{localSettings.skeletonLineWidth} px</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={localSettings.skeletonLineWidth}
                onChange={(e) => updateField('skeletonLineWidth', parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-white">Min Keypoint Confidence Filter</span>
                <span className="font-mono text-cyan-400">{Math.round(localSettings.minConfidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.6"
                step="0.05"
                value={localSettings.minConfidence}
                onChange={(e) => updateField('minConfidence', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10">
              <div>
                <span className="font-bold text-white block">Default Pose Simulator Mode</span>
                <span className="text-slate-400 text-[11px]">Runs algorithm with simulated avatar</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.simulatorMode}
                onChange={(e) => updateField('simulatorMode', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <span className="font-orbitron font-bold text-rose-400 block text-xs uppercase tracking-wider">
              Profile Reset
            </span>
            <p className="text-slate-400 text-[11px]">
              Erase all saved player XP, level progress, and local high scores from browser memory.
            </p>
            {showConfirmReset ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-orbitron font-bold text-xs uppercase hover:bg-rose-500 transition-colors"
                >
                  Confirm Full Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-orbitron text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-900/30 font-orbitron text-xs uppercase tracking-wider transition-colors"
              >
                Reset Progress Data
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/20 pt-3 text-right">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-orbitron text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
};
