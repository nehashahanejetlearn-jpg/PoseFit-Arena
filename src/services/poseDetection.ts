import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { ExerciseId, Keypoint, Pose } from '../types';

export const POSE_CONNECTIONS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['nose', 'left_shoulder'],
  ['nose', 'right_shoulder'],
];

class PoseDetectorService {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;

  public async initialize(): Promise<boolean> {
    if (this.detector) return true;
    if (this.isInitializing) {
      // wait until finished
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return !!this.detector;
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      await tf.ready();
      
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.2,
        }
      );
      this.isInitializing = false;
      return true;
    } catch (err: unknown) {
      console.warn('MoveNet WebGL initialization error, retrying with CPU backend:', err);
      try {
        await tf.setBackend('cpu');
        await tf.ready();
        this.detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
            minPoseScore: 0.2,
          }
        );
        this.isInitializing = false;
        return true;
      } catch (innerErr: unknown) {
        this.initError = innerErr instanceof Error ? innerErr.message : 'Failed to load MoveNet model';
        this.isInitializing = false;
        return false;
      }
    }
  }

  public isReady(): boolean {
    return !!this.detector;
  }

  public getInitError(): string | null {
    return this.initError;
  }

  public async estimatePose(
    input: HTMLVideoElement | HTMLCanvasElement | ImageData,
    flipHorizontal: boolean = false
  ): Promise<Pose | null> {
    if (!this.detector) {
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(input, {
        flipHorizontal,
        maxPoses: 1,
      });

      if (!poses || poses.length === 0) {
        return null;
      }

      const primary = poses[0];
      const keypoints: Keypoint[] = primary.keypoints.map((kp) => ({
        x: kp.x,
        y: kp.y,
        score: kp.score ?? 0,
        name: kp.name,
      }));

      return {
        keypoints,
        score: primary.score ?? 0,
      };
    } catch (err) {
      console.error('Error estimating pose', err);
      return null;
    }
  }

  /**
   * Generates a simulated procedural pose for test mode / fallback demo
   */
  public generateSimulatedPose(exerciseId: ExerciseId, timeMs: number, width: number, height: number): Pose {
    const cx = width / 2;
    const cy = height * 0.45;
    const cycle = (timeMs % 3000) / 3000; // 0 to 1
    const sinWave = (Math.sin(cycle * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0 to 1

    let hipY = cy + 40;
    let kneeY = cy + 140;
    let ankleY = cy + 240;
    let leftKneeX = cx - 45;
    let rightKneeX = cx + 45;
    let leftAnkleX = cx - 50;
    let rightAnkleX = cx + 50;
    let leftWristX = cx - 65;
    let rightWristX = cx + 65;
    let leftWristY = cy - 20;
    let rightWristY = cy - 20;
    let leftElbowX = cx - 60;
    let rightElbowX = cx + 60;
    let leftElbowY = cy - 30;
    let rightElbowY = cy - 30;

    switch (exerciseId) {
      case 'squats': {
        // Hips drop down, knees bend out
        const depth = sinWave * 80;
        hipY += depth;
        leftKneeX -= sinWave * 15;
        rightKneeX += sinWave * 15;
        leftWristY = hipY - 20;
        rightWristY = hipY - 20;
        break;
      }
      case 'jumping_jacks': {
        // Arms sweep up, feet spread out
        const spread = sinWave * 50;
        leftAnkleX -= spread;
        rightAnkleX += spread;
        leftWristX = cx - 80 + sinWave * 20;
        rightWristX = cx + 80 - sinWave * 20;
        leftWristY = (cy + 40) - sinWave * 180;
        rightWristY = (cy + 40) - sinWave * 180;
        break;
      }
      case 'high_knees': {
        const isLeft = (timeMs % 2000) < 1000;
        const lift = (Math.sin(((timeMs % 1000) / 1000) * Math.PI)) * 90;
        if (isLeft) {
          kneeY = (cy + 140) - lift;
        } else {
          kneeY = (cy + 140) - lift;
        }
        break;
      }
      case 'overhead_press': {
        // Wrists press straight up from shoulder level
        const press = sinWave * 120;
        leftWristY = (cy - 30) - press;
        rightWristY = (cy - 30) - press;
        leftElbowY = (cy) - press * 0.7;
        rightElbowY = (cy) - press * 0.7;
        break;
      }
      case 'side_lunges': {
        const lunge = sinWave * 60;
        cx - lunge;
        break;
      }
      case 'bicep_curls': {
        // Forearms curl from bottom to top
        const curl = sinWave * 100;
        leftWristY = (cy + 50) - curl;
        rightWristY = (cy + 50) - curl;
        break;
      }
      case 'warrior_hold': {
        // Level T-pose
        leftWristX = cx - 140;
        rightWristX = cx + 140;
        leftWristY = cy - 40;
        rightWristY = cy - 40;
        leftElbowX = cx - 80;
        rightElbowX = cx + 80;
        leftElbowY = cy - 40;
        rightElbowY = cy - 40;
        break;
      }
    }

    const keypoints: Keypoint[] = [
      { name: 'nose', x: cx, y: cy - 90, score: 0.95 },
      { name: 'left_eye', x: cx - 10, y: cy - 95, score: 0.95 },
      { name: 'right_eye', x: cx + 10, y: cy - 95, score: 0.95 },
      { name: 'left_ear', x: cx - 22, y: cy - 90, score: 0.9 },
      { name: 'right_ear', x: cx + 22, y: cy - 90, score: 0.9 },
      { name: 'left_shoulder', x: cx - 45, y: cy - 40, score: 0.98 },
      { name: 'right_shoulder', x: cx + 45, y: cy - 40, score: 0.98 },
      { name: 'left_elbow', x: leftElbowX, y: leftElbowY, score: 0.96 },
      { name: 'right_elbow', x: rightElbowX, y: rightElbowY, score: 0.96 },
      { name: 'left_wrist', x: leftWristX, y: leftWristY, score: 0.94 },
      { name: 'right_wrist', x: rightWristX, y: rightWristY, score: 0.94 },
      { name: 'left_hip', x: cx - 35, y: hipY, score: 0.97 },
      { name: 'right_hip', x: cx + 35, y: hipY, score: 0.97 },
      { name: 'left_knee', x: leftKneeX, y: kneeY, score: 0.96 },
      { name: 'right_knee', x: rightKneeX, y: kneeY, score: 0.96 },
      { name: 'left_ankle', x: leftAnkleX, y: ankleY, score: 0.93 },
      { name: 'right_ankle', x: rightAnkleX, y: ankleY, score: 0.93 },
    ];

    return {
      keypoints,
      score: 0.95,
    };
  }
}

export const poseDetector = new PoseDetectorService();
