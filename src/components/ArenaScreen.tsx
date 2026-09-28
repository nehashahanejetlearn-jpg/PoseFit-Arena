import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, CameraOff, RefreshCw, Volume2, VolumeX, Pause, Play, 
  ChevronRight, Award, Zap, AlertTriangle, ShieldCheck, Flame, RotateCcw, 
  Sparkles, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { DifficultyLevel, ExerciseDefinition, ExerciseId, FormFeedback, GameSettings, Keypoint, Pose, WorkoutSessionStats } from '../types';
import { EXERCISE_LIST, ExerciseEvaluator, getKeypoint } from '../utils/exercises';
import { POSE_CONNECTIONS, poseDetector } from '../services/poseDetection';
import { KeypointSmoother } from '../utils/math';
import { sound } from '../utils/audio';

interface ArenaScreenProps {
  initialExerciseId: ExerciseId;
  isCircuit: boolean;
  difficulty: DifficultyLevel;
  settings: GameSettings;
  onFinishWorkout: (stats: WorkoutSessionStats) => void;
  onExit: () => void;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  initialExerciseId,
  isCircuit,
  difficulty,
  settings,
  onFinishWorkout,
  onExit,
}) => {
  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const smootherRef = useRef<KeypointSmoother>(new KeypointSmoother(0.65));
  const evaluatorRef = useRef<ExerciseEvaluator | null>(null);

  // Exercise & Circuit state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(() => {
    const idx = EXERCISE_LIST.findIndex((e) => e.id === initialExerciseId);
    return idx >= 0 ? idx : 0;
  });

  const currentExercise = EXERCISE_LIST[currentExerciseIndex];

  // Target reps based on difficulty
  const targetReps = 
    difficulty === 'cadet' ? currentExercise.cadetReps :
    difficulty === 'pilot' ? currentExercise.pilotReps :
    difficulty === 'commander' ? currentExercise.commanderReps : currentExercise.galaxyMasterReps;

  // Live Gameplay State
  const [reps, setReps] = useState(0);
  const [validRepsCount, setValidRepsCount] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [feedback, setFeedback] = useState<FormFeedback>({
    status: 'adjust',
    message: 'INITIALIZING AI SENSORS...',
    progressPercentage: 0,
    inActivePhase: false,
  });
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [fps, setFps] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workoutStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Camera & System State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(settings.simulatorMode);
  const [mirror, setMirror] = useState<boolean>(settings.mirrorCamera);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);

  // Circuit rest modal
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restCountdown, setRestCountdown] = useState<number>(8);

  // Visual XP burst effect
  const [xpPopup, setXpPopup] = useState<{ text: string; id: number } | null>(null);

  // Initialize evaluator when exercise or difficulty changes
  useEffect(() => {
    evaluatorRef.current = new ExerciseEvaluator(currentExercise.id, difficulty);
    smootherRef.current.reset();
    setReps(0);
    setValidRepsCount(0);
  }, [currentExercise.id, difficulty]);

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused && !isResting) {
        setElapsedSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isResting]);

  // Circuit Rest Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restCountdown > 0) {
      interval = setInterval(() => {
        setRestCountdown((c) => {
          if (c <= 1) {
            setIsResting(false);
            sound.playCountdown(true);
            return 8;
          }
          sound.playCountdown(false);
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restCountdown]);

  // Camera Stream Setup
  const setupCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC camera API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (!videoRef.current) return resolve(true);
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(resolve).catch(resolve);
          };
        });
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access was denied or is unavailable.';
      console.warn('Camera initialization notice:', msg);
      setCameraError(msg);
      // Automatically enable simulation mode if camera unavailable so user is never stuck!
      setIsSimulatorActive(true);
    }
  }, []);

  // Initialize MoveNet and Camera on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsModelLoading(true);
      try {
        await poseDetector.initialize();
      } catch (e) {
        console.error('Pose detector initialization error:', e);
      }
      if (mounted) {
        setIsModelLoading(false);
        if (!settings.simulatorMode) {
          setupCamera();
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [setupCamera, settings.simulatorMode]);

  // Complete exercise / Finish workout handler
  const handleCompleteCurrentExercise = useCallback(() => {
    sound.playVictory();

    const diffMultiplier = 
      difficulty === 'cadet' ? 1.0 :
      difficulty === 'pilot' ? 1.25 :
      difficulty === 'commander' ? 1.5 : 2.0;

    const baseCal = reps * currentExercise.caloriesPerRep;
    const finalScore = Math.round(score + (reps * 100 * diffMultiplier));
    const accuracy = reps > 0 ? Math.min(100, Math.round((validRepsCount / reps) * 100)) : 95;
    const xpEarned = Math.round(finalScore * 0.15 + (isCircuit ? 500 : 100));

    if (isCircuit && currentExerciseIndex < EXERCISE_LIST.length - 1) {
      // Advance to next circuit exercise with rest interval
      setIsResting(true);
      setRestCountdown(8);
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // Workout completely finished!
      onFinishWorkout({
        exerciseId: currentExercise.id,
        exerciseName: currentExercise.name,
        targetReps,
        completedReps: reps,
        validReps: validRepsCount,
        accuracyScore: accuracy,
        totalScore: finalScore,
        maxCombo,
        xpEarned,
        caloriesBurned: Math.round(baseCal),
        durationSeconds: elapsedSeconds,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [reps, validRepsCount, score, difficulty, currentExercise, isCircuit, currentExerciseIndex, targetReps, maxCombo, elapsedSeconds, onFinishWorkout]);

  // Main Detection and Rendering Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const detectAndRender = async () => {
      const now = performance.now();
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas) {
        requestRef.current = requestAnimationFrame(detectAndRender);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        requestRef.current = requestAnimationFrame(detectAndRender);
        return;
      }

      // Sync canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      let currentPose: Pose | null = null;

      if (isSimulatorActive) {
        // Run procedural simulation
        currentPose = poseDetector.generateSimulatedPose(currentExercise.id, now, width, height);
      } else if (isCameraActive && video && video.readyState >= 2) {
        // Estimate pose using MoveNet
        currentPose = await poseDetector.estimatePose(video, false);
      }

      if (currentPose && currentPose.keypoints.length > 0) {
        // Calculate average confidence score of primary body keypoints
        const validKps = currentPose.keypoints.filter((k) => (k.score ?? 0) > 0.15);
        const avgConfidence = validKps.length > 0 
          ? validKps.reduce((acc, k) => acc + (k.score ?? 0), 0) / validKps.length 
          : 0;
        
        setDetectionConfidence(Math.round(avgConfidence * 100));

        // Smooth keypoints to eliminate webcam jitter
        const smoothedKeypoints = smootherRef.current.smoothKeypoints(currentPose.keypoints);

        // Evaluate exercise form if not paused or resting
        if (!isPaused && !isResting && evaluatorRef.current) {
          const evalResult = evaluatorRef.current.evaluateFrame(smoothedKeypoints);
          setFeedback(evalResult.feedback);

          if (evalResult.repCompleted) {
            setReps((prev) => {
              const nextReps = prev + 1;
              setValidRepsCount((v) => v + 1);

              // Sound & combo calculation
              setCombo((c) => {
                const newCombo = Math.min(c + 1, 4);
                setMaxCombo((m) => Math.max(m, newCombo));
                sound.playRepSuccess(newCombo);
                return newCombo;
              });

              // Add score
              const baseRepScore = 150;
              const bonusScore = baseRepScore * combo;
              setScore((s) => s + bonusScore);

              // Show XP burst popup
              setXpPopup({ text: `+${bonusScore} XP [x${combo}]`, id: Date.now() });

              // Check if target reps completed
              if (nextReps >= targetReps) {
                setTimeout(() => {
                  handleCompleteCurrentExercise();
                }, 400);
              }

              return nextReps;
            });
          }
        }

        // Render MoveNet Skeleton overlay
        if (showSkeleton) {
          renderSkeleton(ctx, smoothedKeypoints, width, height, feedback.status);
        }
      } else {
        setDetectionConfidence(0);
      }

      requestRef.current = requestAnimationFrame(detectAndRender);
    };

    requestRef.current = requestAnimationFrame(detectAndRender);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    isCameraActive, 
    isSimulatorActive, 
    isPaused, 
    isResting, 
    showSkeleton, 
    currentExercise.id, 
    feedback.status, 
    combo, 
    targetReps, 
    handleCompleteCurrentExercise
  ]);

  // Skeleton Renderer
  const renderSkeleton = (
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    w: number,
    h: number,
    status: FormFeedback['status']
  ) => {
    // Determine color based on form state
    let strokeColor = '#06b6d4'; // Cyan default
    let jointColor = '#ffffff';
    let glowColor = '#06b6d4';

    if (status === 'correct') {
      strokeColor = '#10b981'; // Green: correct form
      jointColor = '#a7f3d0';
      glowColor = '#10b981';
    } else if (status === 'adjust') {
      strokeColor = '#f59e0b'; // Yellow: adjust position
      jointColor = '#fde68a';
      glowColor = '#f59e0b';
    } else if (status === 'incorrect') {
      strokeColor = '#f43f5e'; // Red: incorrect / lost tracking
      jointColor = '#fecdd3';
      glowColor = '#f43f5e';
    }

    ctx.save();

    // Draw connection lines
    ctx.lineWidth = settings.skeletonLineWidth || 4;
    ctx.strokeStyle = strokeColor;
    ctx.shadowBlur = 14;
    ctx.shadowColor = glowColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    POSE_CONNECTIONS.forEach(([nameA, nameB]) => {
      const kpA = getKeypoint(keypoints, nameA);
      const kpB = getKeypoint(keypoints, nameB);

      if (kpA && kpB && (kpA.score ?? 0) > settings.minConfidence && (kpB.score ?? 0) > settings.minConfidence) {
        ctx.beginPath();
        ctx.moveTo(kpA.x, kpA.y);
        ctx.lineTo(kpB.x, kpB.y);
        ctx.stroke();
      }
    });

    // Draw joint nodes
    keypoints.forEach((kp) => {
      if ((kp.score ?? 0) > settings.minConfidence) {
        const isHead = kp.name === 'nose';
        const radius = isHead ? 8 : 5;

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();

        // Inner core
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = jointColor;
        ctx.fill();

        // Head target reticle
        if (isHead) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 22, 0, Math.PI * 2);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  };

  // Form color badges
  const getStatusColor = () => {
    switch (feedback.status) {
      case 'correct':
        return 'border-emerald-500 bg-emerald-950/70 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
      case 'adjust':
        return 'border-amber-500 bg-amber-950/70 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
      case 'incorrect':
        return 'border-rose-500 bg-rose-950/70 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
    }
  };

  return (
    <div className="relative z-10 w-full min-h-[calc(100vh-65px)] max-w-7xl mx-auto px-4 py-4 flex flex-col justify-between">
      {/* Top Arena HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        {/* Left: Exercise Info & Stage */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center glow-cyan">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-orbitron font-black text-lg md:text-xl text-white tracking-wide">
                {currentExercise.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase">
                {difficulty.replace('_', ' ')}
              </span>
              {isCircuit && (
                <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 uppercase">
                  CIRCUIT [{currentExerciseIndex + 1}/7]
                </span>
              )}
            </div>
            <p className="text-xs font-rajdhani text-slate-300">
              {currentExercise.description}
            </p>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Tracking Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-left">
              <span className="text-[9px] font-mono uppercase text-slate-400 block leading-tight">
                AI POSE TRACKING
              </span>
              <span className="text-xs font-orbitron font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>

          {/* MoveNet Confidence readout */}
          <div className="hidden sm:flex flex-col text-left px-3 py-1.5 rounded-lg bg-slate-950/60 border border-cyan-500/20">
            <span className="text-[9px] font-mono uppercase text-slate-400 block leading-tight">
              BODY DETECTION
            </span>
            <span className="text-xs font-orbitron font-bold text-cyan-300">
              {detectionConfidence}%
            </span>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => {
              sound.playClick();
              setIsPaused(!isPaused);
            }}
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
            className="p-2 rounded-lg border border-cyan-500/30 bg-slate-900/60 hover:bg-cyan-950/40 text-cyan-300 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Abort / Complete Button */}
          <button
            onClick={handleCompleteCurrentExercise}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-orbitron text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Finish Set</span>
          </button>
        </div>
      </div>

      {/* Main Arena Workspace (Webcam Left + HUD Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-start">
        {/* Left: Large Real-Time Camera Feed & MoveNet Skeleton Overlay (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] max-w-[680px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-cyan-500/40 glow-cyan">
            {/* Real Webcam Video (hidden behind canvas or mirrored underneath) */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                mirror ? 'scale-x-[-1]' : ''
              } ${isSimulatorActive ? 'opacity-20' : 'opacity-85'}`}
            />

            {/* Skeleton Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full object-cover z-10 ${
                mirror ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Sci-Fi Viewport HUD Overlays */}
            {/* Corner Reticles */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-orbitron uppercase tracking-widest text-cyan-300 bg-black/50 px-2 py-0.5 rounded border border-cyan-500/30">
                {isSimulatorActive ? 'SIMULATOR PROTOCOL' : 'OPTICAL CAM-01'}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20 pointer-events-none">
              <span className="text-[10px] font-mono text-cyan-400/90 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {fps} FPS • LATENCY: LOW
              </span>
            </div>

            {/* Floating XP Burst Popup */}
            {xpPopup && (
              <div 
                key={xpPopup.id}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce"
              >
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-orbitron font-black text-sm md:text-base tracking-wider uppercase shadow-[0_0_20px_#f59e0b]">
                  {xpPopup.text}
                </div>
              </div>
            )}

            {/* Loading / Fallback Screen */}
            {isModelLoading && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <div>
                  <h3 className="text-base font-orbitron font-bold text-cyan-300">
                    BOOTING MOVENET NEURAL ENGINE
                  </h3>
                  <p className="text-xs font-rajdhani text-slate-400 mt-1">
                    Compiling WebGL tensors & locking biomechanical sensors...
                  </p>
                </div>
              </div>
            )}

            {/* Camera Permission or Error Screen */}
            {cameraError && !isSimulatorActive && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <div>
                  <h3 className="text-base font-orbitron font-bold text-white">
                    CAMERA ACCESS REQUIRED
                  </h3>
                  <p className="text-xs font-rajdhani text-slate-300 max-w-md mt-1">
                    {cameraError}. You can grant camera permission in your browser or engage the Test Simulation mode.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={setupCamera}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-orbitron text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => setIsSimulatorActive(true)}
                    className="px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-orbitron text-xs font-bold uppercase tracking-wider hover:bg-cyan-900/40 transition-colors"
                  >
                    Enable Pose Simulator
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Camera Toolbar */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                {/* Mirror Toggle */}
                <button
                  onClick={() => setMirror(!mirror)}
                  title="Toggle Mirror Camera"
                  className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-rajdhani uppercase font-bold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mirror</span>
                </button>

                {/* Skeleton Visibility */}
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  title="Toggle Skeleton Overlay"
                  className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-rajdhani uppercase font-bold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                >
                  {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Skeleton</span>
                </button>
              </div>

              {/* Simulation Mode Toggle */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSimulatorActive(!isSimulatorActive);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-orbitron uppercase tracking-wider backdrop-blur-sm transition-all ${
                  isSimulatorActive
                    ? 'border-yellow-400 bg-yellow-950/60 text-yellow-300'
                    : 'border-cyan-500/30 bg-black/60 text-cyan-300 hover:bg-cyan-950/70'
                }`}
              >
                {isSimulatorActive ? 'Simulation: ON' : 'Simulation: OFF'}
              </button>
            </div>
          </div>

          {/* Form Guide Banner below Camera */}
          <div className="w-full max-w-[680px] mt-3">
            <div className={`w-full p-3.5 rounded-xl border transition-all text-center ${getStatusColor()}`}>
              <div className="flex items-center justify-center gap-2">
                <span className="font-orbitron font-black text-sm md:text-base tracking-wider uppercase">
                  {feedback.message}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Exercise HUD, Rep Progress Gauge & Live Feedback (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Rep Progress HUD Panel */}
          <div className="hud-panel p-5 rounded-2xl glow-cyan space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  REPETITION MATRIX
                </span>
                <span className="text-xs font-bold text-slate-300 font-orbitron">
                  {currentExercise.isTimed ? 'TARGET DURATION' : 'TARGET REPS'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  COMBO MULTIPLIER
                </span>
                <span className="text-sm font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                  x{combo} STREAK
                </span>
              </div>
            </div>

            {/* Circular / Large Rep Display */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Glowing Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={
                      feedback.status === 'correct' ? '#10b981' :
                      feedback.status === 'adjust' ? '#f59e0b' : '#06b6d4'
                    }
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={
                      (2 * Math.PI * 50) * (1 - Math.min(1, reps / targetReps))
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  />
                </svg>

                {/* Inner Counter Text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-orbitron font-black text-4xl sm:text-5xl text-white tracking-tight">
                    {reps}
                  </span>
                  <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-widest">
                    / {targetReps} {currentExercise.isTimed ? 'SEC' : 'REPS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Angle & Real-time Biometrics */}
            {feedback.currentAngle !== undefined && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-rajdhani">
                  <span className="text-slate-300 font-bold uppercase">
                    Joint Angle Telemetry:
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {feedback.currentAngle}° 
                    {feedback.targetAngle ? ` (Target < ${feedback.targetAngle}°)` : ''}
                  </span>
                </div>
                {/* Real-time angle progress bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
                  <div
                    className={`h-full transition-all duration-200 ${
                      feedback.status === 'correct'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${feedback.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Session Stats Bar */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Score</span>
                <span className="text-sm md:text-base font-orbitron font-bold text-cyan-300">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Est. Burn</span>
                <span className="text-sm md:text-base font-orbitron font-bold text-orange-400">
                  {Math.round(reps * currentExercise.caloriesPerRep)} kcal
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Time</span>
                <span className="text-sm md:text-base font-orbitron font-bold text-slate-200">
                  {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Form Checkpoints Card */}
          <div className="hud-panel p-4 rounded-2xl glow-cyan space-y-2.5">
            <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-orbitron uppercase text-cyan-300 tracking-wider">
                AI Form Verification
              </span>
            </div>
            <ul className="space-y-1.5 text-xs font-rajdhani text-slate-300">
              {currentExercise.formTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Rest Interval Modal for Circuit Mode */}
      {isResting && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="hud-panel p-8 rounded-2xl max-w-md w-full text-center space-y-5 glow-cyan">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-orbitron uppercase tracking-widest">
              RECHARGE CHAMBER
            </span>

            <div>
              <h3 className="text-2xl font-orbitron font-black text-white">
                NEXT: {currentExercise.name}
              </h3>
              <p className="text-xs font-rajdhani text-slate-300 mt-1">
                Catch your breath. Prepare your stance for the next exercise protocol.
              </p>
            </div>

            <div className="text-6xl font-orbitron font-black text-cyan-400 animate-pulse">
              {restCountdown}
            </div>

            <button
              onClick={() => {
                sound.playCountdown(true);
                setIsResting(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs uppercase tracking-wider transition-all"
            >
              Skip Rest & Begin Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
