import type { AssistantAppearance } from '@erxes/core-contract';
import { EYE_H, EYE_SPLIT, EYE_W, REST_GAZE, type EyeCfg, type Face } from './face';
import { lerp } from './math';

export type AvatarExpression = AssistantAppearance['expression'];

const eye = (w: number, h: number, tilt = 0, open = 1): EyeCfg => ({ w, h, tilt, open });

const pair = (w: number, h: number, tilt = 0, open = 1): [EyeCfg, EyeCfg] => [
  eye(w, h, tilt, open),
  eye(w, h, -tilt, open),
];

const face = (yaw: number, pitch: number, roll: number, split: number, eyes: [EyeCfg, EyeCfg]) => ({
  gaze: { yaw, pitch, roll },
  split,
  eyes,
});

export const EXPRESSIONS: Record<AvatarExpression, Face> = {
  neutral: { gaze: REST_GAZE, split: EYE_SPLIT, eyes: pair(EYE_W, EYE_H) },
  attentive: face(4, 5, -4, 16, pair(0.21, 0.44)),
  surprised: face(3, -3, 0, 19, pair(0.45, 0.47)),
  excited: face(6, -14, 0, 19.5, pair(0.4, 0.56, -10)),
  happy: face(5, 9, 0, 17, pair(0.27, 0.17, 14)),
  laughing: face(4, 14, 0, 18, pair(0.34, 0.13, 20)),
  angry: face(3, 7, 0, 17, pair(0.34, 0.15, 30)),
  sad: face(3, -13, 0, 16, pair(0.22, 0.4, -28)),
  scared: face(2, -20, 0, 20.5, pair(0.4, 0.6)),
  wary: face(12, 6, -6, 16, [eye(0.21, 0.4), eye(0.22, 0.15)]),
  confused: face(-14, 3, 8, 16.5, [eye(0.2, 0.44, -18), eye(0.28, 0.17, 14)]),
  curious: face(16, -9, -15, 16.5, [eye(0.24, 0.46, -8), eye(0.2, 0.38, -8)]),
  proud: face(5, 17, 0, 17, pair(0.3, 0.15, 18)),
  shy: face(-19, -14, -7, 14, pair(0.17, 0.3)),
  bored: face(-22, 2, 0, 16, pair(0.3, 0.12)),
  sleepy: face(6, -9, -3, 16, pair(0.2, 0.42, 0, 0.42)),
};

const lerpEye = (a: EyeCfg, b: EyeCfg, t: number): EyeCfg => ({
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  tilt: lerp(a.tilt, b.tilt, t),
  open: lerp(a.open, b.open, t),
});

export const blendFace = (a: Face, b: Face, t: number): Face => ({
  gaze: {
    yaw: lerp(a.gaze.yaw, b.gaze.yaw, t),
    pitch: lerp(a.gaze.pitch, b.gaze.pitch, t),
    roll: lerp(a.gaze.roll, b.gaze.roll, t),
  },
  split: lerp(a.split, b.split, t),
  eyes: [lerpEye(a.eyes[0], b.eyes[0], t), lerpEye(a.eyes[1], b.eyes[1], t)],
});
