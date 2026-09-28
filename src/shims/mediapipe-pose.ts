/**
 * Shim for @mediapipe/pose to resolve missing ESM named exports in bundlers
 */
export class Pose {
  setOptions(_options?: unknown) {}
  onResults(_listener?: unknown) {}
  initialize() {
    return Promise.resolve();
  }
  send(_input?: unknown) {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  reset() {}
}

export const POSE_CONNECTIONS: [number, number][] = [];
export const POSE_LANDMARKS: Record<string, number> = {};
export const POSE_LANDMARKS_LEFT: Record<string, number> = {};
export const POSE_LANDMARKS_RIGHT: Record<string, number> = {};
export const POSE_LANDMARKS_NEUTRAL: Record<string, number> = {};
export const VERSION = '0.5.1675469404';

export default {
  Pose,
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  POSE_LANDMARKS_NEUTRAL,
  VERSION,
};
