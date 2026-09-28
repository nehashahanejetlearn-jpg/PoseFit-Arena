import { DifficultyLevel, ExerciseDefinition, ExerciseId, FormFeedback, Keypoint } from '../types';
import { calculateAngle, calculateDistance } from './math';

export const EXERCISE_LIST: ExerciseDefinition[] = [
  {
    id: 'squats',
    name: 'Cosmic Squats',
    codename: 'GRAV-SQUAT-01',
    category: 'Lower Body & Core',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    description: 'Lower your center of gravity until thighs are parallel to deck, keeping chest high and heels rooted.',
    formTips: [
      'Keep your chest proud and spine neutral',
      'Push hips back and bend knees past 100 degrees',
      'Drive through the heels to return to standing',
    ],
    cadetReps: 8,
    pilotReps: 12,
    commanderReps: 16,
    galaxyMasterReps: 20,
    caloriesPerRep: 0.35,
    iconName: 'Flame',
    primaryKeypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
  },
  {
    id: 'jumping_jacks',
    name: 'Star Jumps',
    codename: 'NOVA-JACK-02',
    category: 'Full Body Cardio',
    targetMuscles: ['Deltoids', 'Calves', 'Cardiovascular System'],
    description: 'Jump or step dynamically, sweeping arms overhead into a stellar cross while spreading your stance.',
    formTips: [
      'Raise arms fully overhead into a star silhouette',
      'Spread feet wider than shoulder-width simultaneously',
      'Maintain rhythm and light landing on balls of feet',
    ],
    cadetReps: 12,
    pilotReps: 20,
    commanderReps: 30,
    galaxyMasterReps: 40,
    caloriesPerRep: 0.25,
    iconName: 'Sparkles',
    primaryKeypoints: ['left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder', 'left_ankle', 'right_ankle'],
  },
  {
    id: 'high_knees',
    name: 'Cosmic Strides',
    codename: 'WARP-STRIDE-03',
    category: 'Agility & Core',
    targetMuscles: ['Hip Flexors', 'Abdominals', 'Quadriceps'],
    description: 'Powerfully drive alternating knees upward to waist level with explosive rhythm and steady posture.',
    formTips: [
      'Drive knees up to hip height (parallel to deck)',
      'Keep your upper torso upright without leaning back',
      'Alternate legs cleanly with crisp elevation',
    ],
    cadetReps: 12,
    pilotReps: 20,
    commanderReps: 30,
    galaxyMasterReps: 40,
    caloriesPerRep: 0.22,
    iconName: 'Zap',
    primaryKeypoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee'],
  },
  {
    id: 'overhead_press',
    name: 'Plasma Thrust',
    codename: 'PLASM-PRESS-04',
    category: 'Shoulders & Arms',
    targetMuscles: ['Anterior Deltoids', 'Triceps', 'Upper Trapezius'],
    description: 'From shoulder level, press your arms straight toward the ceiling, engaging your core and full lockout.',
    formTips: [
      'Start with hands at shoulder level, elbows bent 90°',
      'Press both arms straight up overhead until locked out',
      'Lower smoothly back to shoulder level',
    ],
    cadetReps: 8,
    pilotReps: 12,
    commanderReps: 16,
    galaxyMasterReps: 20,
    caloriesPerRep: 0.28,
    iconName: 'ArrowUpCircle',
    primaryKeypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
  },
  {
    id: 'side_lunges',
    name: 'Orbital Lunges',
    codename: 'ORBIT-LUNGE-05',
    category: 'Lower Body & Balance',
    targetMuscles: ['Glutes', 'Adductors', 'Hamstrings'],
    description: 'Step wide and sink deep into one hip while keeping the opposite leg straight, then alternate.',
    formTips: [
      'Take a wide stance and bend one knee deeply',
      'Keep the other leg fully extended and toes forward',
      'Push off firmly to return to the neutral stance',
    ],
    cadetReps: 8,
    pilotReps: 12,
    commanderReps: 16,
    galaxyMasterReps: 20,
    caloriesPerRep: 0.32,
    iconName: 'MoveHorizontal',
    primaryKeypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
  },
  {
    id: 'bicep_curls',
    name: 'Kinetic Curls',
    codename: 'KINETIC-CURL-06',
    category: 'Arms & Grip',
    targetMuscles: ['Biceps Brachii', 'Brachialis', 'Forearms'],
    description: 'Lock your elbows close to your torso and curl your forearms up toward your shoulders.',
    formTips: [
      'Keep upper arms stationary pinned by your ribs',
      'Curl wrists all the way up towards shoulder line',
      'Fully extend arms at the bottom before next rep',
    ],
    cadetReps: 10,
    pilotReps: 15,
    commanderReps: 20,
    galaxyMasterReps: 25,
    caloriesPerRep: 0.20,
    iconName: 'Activity',
    primaryKeypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
  },
  {
    id: 'warrior_hold',
    name: 'Zenith Hold',
    codename: 'ZENITH-STANCE-07',
    category: 'Isometric Core & Delts',
    targetMuscles: ['Shoulders', 'Core', 'Stabilizers'],
    description: 'Extend arms horizontally in line with your shoulders, lock your core, and hold the laser-steady pose.',
    formTips: [
      'Keep both arms parallel to deck at shoulder level',
      'Engage your abdominal core and stand tall',
      'Maintain stability inside the targeting ring',
    ],
    cadetReps: 15, // seconds
    pilotReps: 20,
    commanderReps: 30,
    galaxyMasterReps: 45,
    isTimed: true,
    caloriesPerRep: 0.18, // per second
    iconName: 'Shield',
    primaryKeypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
  },
];

// Helper to look up keypoint by name from MoveNet keypoints array
export function getKeypoint(keypoints: Keypoint[], name: string): Keypoint | undefined {
  return keypoints.find((k) => k.name === name);
}

/**
 * Exercise State Evaluator
 * Tracks repetition cycles and live posture evaluation
 */
export class ExerciseEvaluator {
  private exerciseId: ExerciseId;
  private difficulty: DifficultyLevel;
  private stage: 'initial' | 'ready' | 'active_peak' | 'completing' = 'initial';
  private lastRepTimestamp: number = 0;
  private holdTimerSeconds: number = 0;
  private lastHoldCheck: number = 0;
  private lastSide: 'left' | 'right' | 'none' = 'none';

  constructor(exerciseId: ExerciseId, difficulty: DifficultyLevel) {
    this.exerciseId = exerciseId;
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: DifficultyLevel) {
    this.difficulty = diff;
  }

  public reset() {
    this.stage = 'initial';
    this.lastRepTimestamp = 0;
    this.holdTimerSeconds = 0;
    this.lastHoldCheck = 0;
    this.lastSide = 'none';
  }

  /**
   * Process a pose frame and return whether a valid rep was completed and real-time form feedback
   */
  public evaluateFrame(keypoints: Keypoint[]): {
    repCompleted: boolean;
    feedback: FormFeedback;
  } {
    const minConfidence = 0.25;
    const now = Date.now();

    // Map common keypoints
    const nose = getKeypoint(keypoints, 'nose');
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftElbow = getKeypoint(keypoints, 'left_elbow');
    const rightElbow = getKeypoint(keypoints, 'right_elbow');
    const leftWrist = getKeypoint(keypoints, 'left_wrist');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const rightKnee = getKeypoint(keypoints, 'right_knee');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    // Default feedback
    let feedback: FormFeedback = {
      status: 'adjust',
      message: 'Position yourself in the camera view',
      progressPercentage: 0,
      inActivePhase: false,
    };
    let repCompleted = false;

    switch (this.exerciseId) {
      // ----------------------------------------------------
      // 1. SQUATS
      // ----------------------------------------------------
      case 'squats': {
        const hasLeftLeg = leftHip && leftKnee && leftAnkle && (leftHip.score ?? 0) > minConfidence && (leftKnee.score ?? 0) > minConfidence;
        const hasRightLeg = rightHip && rightKnee && rightAnkle && (rightHip.score ?? 0) > minConfidence && (rightKnee.score ?? 0) > minConfidence;

        if (!hasLeftLeg && !hasRightLeg) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Step back: legs must be visible', progressPercentage: 0, inActivePhase: false },
          };
        }

        const leftKneeAngle = hasLeftLeg ? calculateAngle(leftHip!, leftKnee!, leftAnkle!) : 180;
        const rightKneeAngle = hasRightLeg ? calculateAngle(rightHip!, rightKnee!, rightAnkle!) : 180;
        const currentKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

        // Difficulty thresholds for squat depth
        const targetSquatAngle =
          this.difficulty === 'cadet' ? 115 :
          this.difficulty === 'pilot' ? 105 :
          this.difficulty === 'commander' ? 95 : 90;

        const standingAngle = 150;

        // Progress: 0% at standing (150°), 100% at target squat depth
        const progress = Math.max(0, Math.min(100, Math.round(((standingAngle - currentKneeAngle) / (standingAngle - targetSquatAngle)) * 100)));

        feedback.currentAngle = currentKneeAngle;
        feedback.targetAngle = targetSquatAngle;
        feedback.progressPercentage = progress;

        if (currentKneeAngle > standingAngle) {
          if (this.stage === 'active_peak') {
            // Completed rep cycle!
            if (now - this.lastRepTimestamp > 700) {
              repCompleted = true;
              this.lastRepTimestamp = now;
              this.stage = 'ready';
              feedback = {
                status: 'correct',
                message: 'EXCELLENT SQUAT! REP RECORDED',
                progressPercentage: 100,
                inActivePhase: false,
                currentAngle: currentKneeAngle,
                targetAngle: targetSquatAngle,
              };
              return { repCompleted, feedback };
            }
          }
          this.stage = 'ready';
          feedback.status = 'correct';
          feedback.message = 'Standing Ready. Now sink your hips!';
        } else if (currentKneeAngle <= targetSquatAngle) {
          this.stage = 'active_peak';
          feedback.status = 'correct';
          feedback.message = 'PERFECT DEPTH! DRIVE UP!';
          feedback.inActivePhase = true;
        } else {
          // In transition
          if (this.stage === 'ready' || this.stage === 'active_peak') {
            feedback.status = 'adjust';
            feedback.message = `Squat deeper! (${currentKneeAngle}° / Target < ${targetSquatAngle}°)`;
            feedback.inActivePhase = true;
          }
        }
        break;
      }

      // ----------------------------------------------------
      // 2. JUMPING JACKS (STAR JUMPS)
      // ----------------------------------------------------
      case 'jumping_jacks': {
        if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Ensure arms and shoulders are in view', progressPercentage: 0, inActivePhase: false },
          };
        }

        // Arm elevation: check if wrists are above shoulders
        const leftArmUp = leftWrist.y < leftShoulder.y;
        const rightArmUp = rightWrist.y < rightShoulder.y;
        const armsOverhead = leftArmUp && rightArmUp;

        // Check feet separation if ankles are detected
        let feetSpread = true;
        if (leftAnkle && rightAnkle && leftHip && rightHip) {
          const ankleDist = calculateDistance(leftAnkle, rightAnkle);
          const hipDist = Math.max(calculateDistance(leftHip, rightHip), 40);
          feetSpread = ankleDist > hipDist * 1.5;
        }

        const isStarPose = armsOverhead && feetSpread;
        const isClosedPose = leftWrist.y > leftShoulder.y + 40 && rightWrist.y > rightShoulder.y + 40;

        const progress = isStarPose ? 100 : (armsOverhead ? 70 : 0);
        feedback.progressPercentage = progress;

        if (isClosedPose) {
          if (this.stage === 'active_peak') {
            if (now - this.lastRepTimestamp > 450) {
              repCompleted = true;
              this.lastRepTimestamp = now;
              this.stage = 'ready';
              feedback = {
                status: 'correct',
                message: 'STELLAR JUMP COUNTED!',
                progressPercentage: 100,
                inActivePhase: false,
              };
              return { repCompleted, feedback };
            }
          }
          this.stage = 'ready';
          feedback.status = 'correct';
          feedback.message = 'Ready! Jump into a Star!';
        } else if (isStarPose) {
          this.stage = 'active_peak';
          feedback.status = 'correct';
          feedback.message = 'SUPERNOVA REACHED! SNAP BACK!';
          feedback.inActivePhase = true;
        } else {
          feedback.status = 'adjust';
          feedback.message = 'Raise arms overhead and spread legs';
          feedback.inActivePhase = true;
        }
        break;
      }

      // ----------------------------------------------------
      // 3. HIGH KNEES (COSMIC STRIDES)
      // ----------------------------------------------------
      case 'high_knees': {
        if (!leftHip || !rightHip || !leftKnee || !rightKnee) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Hips and knees must be visible', progressPercentage: 0, inActivePhase: false },
          };
        }

        // Distance from hip to knee vertically
        const leftLift = (leftHip.y - leftKnee.y);
        const rightLift = (rightHip.y - rightKnee.y);

        // Height relative to torso (approx distance between shoulder and hip)
        const torsoHeight = leftShoulder ? Math.abs(leftHip.y - leftShoulder.y) : 100;
        const liftThreshold = -torsoHeight * 0.25; // Knee should reach near hip level

        const leftKneeUp = leftLift > liftThreshold;
        const rightKneeUp = rightLift > liftThreshold;

        const currentLift = Math.max(leftLift, rightLift);
        const progress = Math.max(0, Math.min(100, Math.round(((currentLift + torsoHeight * 0.6) / (torsoHeight * 0.6)) * 100)));
        feedback.progressPercentage = progress;

        if (leftKneeUp && this.lastSide !== 'left') {
          if (now - this.lastRepTimestamp > 400) {
            repCompleted = true;
            this.lastRepTimestamp = now;
            this.lastSide = 'left';
            feedback = {
              status: 'correct',
              message: 'LEFT STRIDE LOCKED! SWITCH!',
              progressPercentage: 100,
              inActivePhase: true,
            };
            return { repCompleted, feedback };
          }
        } else if (rightKneeUp && this.lastSide !== 'right') {
          if (now - this.lastRepTimestamp > 400) {
            repCompleted = true;
            this.lastRepTimestamp = now;
            this.lastSide = 'right';
            feedback = {
              status: 'correct',
              message: 'RIGHT STRIDE LOCKED! SWITCH!',
              progressPercentage: 100,
              inActivePhase: true,
            };
            return { repCompleted, feedback };
          }
        } else {
          feedback.status = 'adjust';
          feedback.message = 'Drive alternating knees up to waist level';
        }
        break;
      }

      // ----------------------------------------------------
      // 4. OVERHEAD SHOULDER PRESS (PLASMA THRUST)
      // ----------------------------------------------------
      case 'overhead_press': {
        if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Upper body must be clearly visible', progressPercentage: 0, inActivePhase: false },
          };
        }

        const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

        const targetExtension = 155;
        const rackAngle = 85;

        const progress = Math.max(0, Math.min(100, Math.round(((avgElbowAngle - rackAngle) / (targetExtension - rackAngle)) * 100)));
        feedback.progressPercentage = progress;
        feedback.currentAngle = Math.round(avgElbowAngle);
        feedback.targetAngle = targetExtension;

        const wristsAboveHead = nose ? (leftWrist.y < nose.y && rightWrist.y < nose.y) : true;
        const isFullyExtended = avgElbowAngle >= targetExtension && wristsAboveHead;
        const isRacked = avgElbowAngle <= 100 && leftWrist.y > leftShoulder.y - 30;

        if (isRacked) {
          if (this.stage === 'active_peak') {
            if (now - this.lastRepTimestamp > 650) {
              repCompleted = true;
              this.lastRepTimestamp = now;
              this.stage = 'ready';
              feedback = {
                status: 'correct',
                message: 'PLASMA THRUST COMPLETED!',
                progressPercentage: 100,
                inActivePhase: false,
              };
              return { repCompleted, feedback };
            }
          }
          this.stage = 'ready';
          feedback.status = 'correct';
          feedback.message = 'Ready. Press straight overhead!';
        } else if (isFullyExtended) {
          this.stage = 'active_peak';
          feedback.status = 'correct';
          feedback.message = 'MAX EXTENSION! LOWER TO SHOULDERS';
          feedback.inActivePhase = true;
        } else {
          feedback.status = 'adjust';
          feedback.message = `Push higher to full lockout (${Math.round(avgElbowAngle)}° / ${targetExtension}°)`;
          feedback.inActivePhase = true;
        }
        break;
      }

      // ----------------------------------------------------
      // 5. SIDE LUNGES (ORBITAL LUNGES)
      // ----------------------------------------------------
      case 'side_lunges': {
        if (!leftKnee || !rightKnee || !leftHip || !rightHip || !leftAnkle || !rightAnkle) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Legs and hips must be visible', progressPercentage: 0, inActivePhase: false },
          };
        }

        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

        const lungeTarget = 120;
        const neutralStanding = 155;

        const isLeftLunge = leftKneeAngle < lungeTarget && rightKneeAngle > 145;
        const isRightLunge = rightKneeAngle < lungeTarget && leftKneeAngle > 145;
        const isNeutral = leftKneeAngle > neutralStanding && rightKneeAngle > neutralStanding;

        const activeAngle = Math.min(leftKneeAngle, rightKneeAngle);
        const progress = Math.max(0, Math.min(100, Math.round(((neutralStanding - activeAngle) / (neutralStanding - lungeTarget)) * 100)));
        feedback.progressPercentage = progress;
        feedback.currentAngle = activeAngle;
        feedback.targetAngle = lungeTarget;

        if (isNeutral) {
          if (this.stage === 'active_peak') {
            if (now - this.lastRepTimestamp > 700) {
              repCompleted = true;
              this.lastRepTimestamp = now;
              this.stage = 'ready';
              feedback = {
                status: 'correct',
                message: 'ORBITAL LUNGE COMPLETE! SWITCH SIDES',
                progressPercentage: 100,
                inActivePhase: false,
              };
              return { repCompleted, feedback };
            }
          }
          this.stage = 'ready';
          feedback.status = 'correct';
          feedback.message = 'Ready. Lunge to left or right!';
        } else if (isLeftLunge || isRightLunge) {
          this.stage = 'active_peak';
          feedback.status = 'correct';
          feedback.message = 'DEEP LUNGE HELD! PUSH BACK TO CENTER!';
          feedback.inActivePhase = true;
        } else {
          feedback.status = 'adjust';
          feedback.message = 'Step wide and bend working knee deeper';
          feedback.inActivePhase = true;
        }
        break;
      }

      // ----------------------------------------------------
      // 6. BICEP CURLS (KINETIC CURLS)
      // ----------------------------------------------------
      case 'bicep_curls': {
        const hasLeftArm = leftShoulder && leftElbow && leftWrist;
        const hasRightArm = rightShoulder && rightElbow && rightWrist;

        if (!hasLeftArm && !hasRightArm) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Arms must be visible to track curls', progressPercentage: 0, inActivePhase: false },
          };
        }

        const leftElbowAngle = hasLeftArm ? calculateAngle(leftShoulder!, leftElbow!, leftWrist!) : 180;
        const rightElbowAngle = hasRightArm ? calculateAngle(rightShoulder!, rightElbow!, rightWrist!) : 180;
        const activeElbowAngle = Math.min(leftElbowAngle, rightElbowAngle);

        const targetCurlAngle = 55;
        const extendedAngle = 145;

        const progress = Math.max(0, Math.min(100, Math.round(((extendedAngle - activeElbowAngle) / (extendedAngle - targetCurlAngle)) * 100)));
        feedback.progressPercentage = progress;
        feedback.currentAngle = activeElbowAngle;
        feedback.targetAngle = targetCurlAngle;

        if (activeElbowAngle >= extendedAngle) {
          if (this.stage === 'active_peak') {
            if (now - this.lastRepTimestamp > 500) {
              repCompleted = true;
              this.lastRepTimestamp = now;
              this.stage = 'ready';
              feedback = {
                status: 'correct',
                message: 'KINETIC CURL COUNTED!',
                progressPercentage: 100,
                inActivePhase: false,
              };
              return { repCompleted, feedback };
            }
          }
          this.stage = 'ready';
          feedback.status = 'correct';
          feedback.message = 'Arms extended. Curl up!';
        } else if (activeElbowAngle <= targetCurlAngle) {
          this.stage = 'active_peak';
          feedback.status = 'correct';
          feedback.message = 'PEAK CONTRACTION! LOWER CONTROLLED';
          feedback.inActivePhase = true;
        } else {
          feedback.status = 'adjust';
          feedback.message = `Curl higher (${activeElbowAngle}° / Target < ${targetCurlAngle}°)`;
          feedback.inActivePhase = true;
        }
        break;
      }

      // ----------------------------------------------------
      // 7. ZENITH HOLD (WARRIOR / COSMIC BALANCE)
      // ----------------------------------------------------
      case 'warrior_hold': {
        if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
          return {
            repCompleted: false,
            feedback: { status: 'incorrect', message: 'Shoulders and arms must be in frame', progressPercentage: 0, inActivePhase: false },
          };
        }

        // Arms horizontal: check wrist y-coordinate relative to shoulder y-coordinate
        const leftDelta = Math.abs(leftWrist.y - leftShoulder.y);
        const rightDelta = Math.abs(rightWrist.y - rightShoulder.y);
        const shoulderWidth = Math.max(calculateDistance(leftShoulder, rightShoulder), 60);

        const isLeftArmLevel = leftDelta < shoulderWidth * 0.35;
        const isRightArmLevel = rightDelta < shoulderWidth * 0.35;
        const isArmsExtended = isLeftArmLevel && isRightArmLevel;

        const maxDeviation = shoulderWidth * 0.35;
        const avgDeviation = (leftDelta + rightDelta) / 2;
        const balanceAccuracy = Math.max(0, Math.min(100, Math.round((1 - avgDeviation / maxDeviation) * 100)));

        feedback.progressPercentage = balanceAccuracy;

        if (isArmsExtended) {
          // Increment hold timer
          if (this.lastHoldCheck === 0) {
            this.lastHoldCheck = now;
          } else {
            const deltaMs = now - this.lastHoldCheck;
            if (deltaMs >= 1000) {
              this.holdTimerSeconds += 1;
              this.lastHoldCheck = now;
              repCompleted = true; // Each second held counts towards target duration
            }
          }

          feedback.status = 'correct';
          feedback.message = `STABILITY LOCKED! [${this.holdTimerSeconds}s] KEEP ARMS LEVEL`;
          feedback.inActivePhase = true;
        } else {
          this.lastHoldCheck = now;
          feedback.status = 'adjust';
          feedback.message = 'Raise arms parallel to deck in T-pose';
          feedback.inActivePhase = false;
        }
        break;
      }
    }

    return { repCompleted, feedback };
  }
}
