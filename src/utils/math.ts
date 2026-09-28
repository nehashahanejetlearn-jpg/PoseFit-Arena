import { Keypoint } from '../types';

/**
 * Calculates the internal angle at point B formed by points A, B, and C in degrees (0 - 180°).
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  if (!a || !b || !c) return 0;
  
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle);
}

/**
 * Euclidean distance between two keypoints.
 */
export function calculateDistance(a: Keypoint, b: Keypoint): number {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates vertical angle relative to vertical axis (useful for torso lean)
 */
export function calculateVerticalAngle(top: Keypoint, bottom: Keypoint): number {
  if (!top || !bottom) return 0;
  const dy = bottom.y - top.y;
  const dx = bottom.x - top.x;
  const rad = Math.atan2(Math.abs(dx), Math.abs(dy));
  return Math.round((rad * 180.0) / Math.PI);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Exponential Moving Average (EMA) smoothing for keypoint coordinates
 * to filter webcam frame jitter.
 */
export class KeypointSmoother {
  private smoothedMap: Map<string, { x: number; y: number; score: number }> = new Map();
  private alpha: number;

  constructor(alpha: number = 0.65) {
    this.alpha = alpha; // Higher = more responsive, lower = smoother
  }

  public smoothKeypoints(rawKeypoints: Keypoint[]): Keypoint[] {
    return rawKeypoints.map((kp, idx) => {
      const id = kp.name || `kp_${idx}`;
      const prev = this.smoothedMap.get(id);

      if (!prev) {
        this.smoothedMap.set(id, { x: kp.x, y: kp.y, score: kp.score ?? 0 });
        return { ...kp };
      }

      // If confidence dropped significantly, decay score
      const newX = lerp(prev.x, kp.x, this.alpha);
      const newY = lerp(prev.y, kp.y, this.alpha);
      const newScore = lerp(prev.score, kp.score ?? 0, 0.5);

      this.smoothedMap.set(id, { x: newX, y: newY, score: newScore });

      return {
        ...kp,
        x: newX,
        y: newY,
        score: newScore,
      };
    });
  }

  public reset() {
    this.smoothedMap.clear();
  }
}
