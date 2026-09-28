import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Cpu, Eye, Camera, Check, Sparkles } from 'lucide-react';
import { EXERCISE_LIST } from '../utils/exercises';
import { sound } from '../utils/audio';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'technology' | 'exercises' | 'camera'>('technology');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="hud-panel w-full max-w-3xl p-6 rounded-2xl glow-cyan space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-black text-lg text-white tracking-wide">
              AI SENSORY TRAINING MANUAL
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('technology');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider transition-all ${
              activeTab === 'technology'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#06b6d4]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MoveNet AI & Privacy
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('exercises');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider transition-all ${
              activeTab === 'exercises'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#06b6d4]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Exercise Protocols
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('camera');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron uppercase tracking-wider transition-all ${
              activeTab === 'camera'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#06b6d4]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Camera Setup Guide
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-rajdhani text-slate-300">
          {activeTab === 'technology' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-sm uppercase">
                  <Cpu className="w-4 h-4" />
                  Real-Time MoveNet Neural Architecture
                </div>
                <p className="leading-relaxed">
                  PoseFit Arena runs Google’s lightweight <strong>MoveNet SinglePose Lightning</strong> model. 
                  It tracks 17 key human anatomical landmarks (including nose, shoulders, elbows, wrists, hips, knees, and ankles) 
                  at ultra-low latency directly inside your web browser using WebGL tensor acceleration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-orbitron font-bold text-sm uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  Zero Server Uploads • Absolute Local Privacy
                </div>
                <p className="leading-relaxed">
                  Your webcam stream is processed exclusively in your machine's volatile memory. Video frames never leave your device, 
                  are never transmitted to external servers, and are never saved to disk. All pose analysis and rep scoring occur 100% locally.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20">
                  <span className="font-orbitron font-bold text-white block mb-1">Color: GREEN</span>
                  <p className="text-slate-400">Target depth & angle achieved. Rep peak confirmed.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20">
                  <span className="font-orbitron font-bold text-amber-400 block mb-1">Color: YELLOW</span>
                  <p className="text-slate-400">Pose in transition or needs slight angular adjustment.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/20">
                  <span className="font-orbitron font-bold text-rose-400 block mb-1">Color: RED</span>
                  <p className="text-slate-400">Incomplete form or key anatomical joints obstructed.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className="space-y-3">
              {EXERCISE_LIST.map((ex, idx) => (
                <div key={ex.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-white text-sm">
                      {idx + 1}. {ex.name} <span className="text-cyan-400 text-xs">[{ex.codename}]</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {ex.category}
                    </span>
                  </div>
                  <p className="text-slate-300">{ex.description}</p>
                  <div className="pt-1 border-t border-cyan-500/10 flex flex-wrap gap-2 text-[11px] text-cyan-300 font-mono">
                    {ex.formTips.map((tip, tipIdx) => (
                      <span key={tipIdx} className="inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-cyan-400" />
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                  <span className="font-orbitron font-bold text-cyan-300 block text-sm">
                    1. Distance & Framing
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    Stand approximately 6 to 8 feet (2 to 2.5 meters) away so that your head, shoulders, hips, knees, and feet are visible on the camera view.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                  <span className="font-orbitron font-bold text-cyan-300 block text-sm">
                    2. Illumination & Lighting
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    Ensure adequate front lighting on your body. Avoid bright windows or lamps directly behind you to prevent silhouetting.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                  <span className="font-orbitron font-bold text-cyan-300 block text-sm">
                    3. Contrast Clothing
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    Wear clothing that contrasts with your room background to give the neural edge detectors clear joint boundary markers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-1.5">
                  <span className="font-orbitron font-bold text-cyan-300 block text-sm">
                    4. Test Simulator Option
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    If you are on a machine without a webcam or want to preview the movement algorithms, you can toggle <strong>Simulator Mode</strong> in Settings or during gameplay!
                  </p>
                </div>
              </div>
            </div>
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
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
