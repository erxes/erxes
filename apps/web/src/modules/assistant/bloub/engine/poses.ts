import { EYE_H, EYE_SPLIT, EYE_W, REST_GAZE, type EyeCfg, type Face } from './face';
import { TAU, clamp, easeOutCubic } from './math';
import { circle, hullOfCircles, profileFromPolygon, type Silhouette } from './outline';

export interface Dot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface Pose extends Face {
  sil: Silhouette;
  offX: number;
  offY: number;
  eyeAlpha: number;
  dots: Dot[];
}

export type AvatarState = 'idle' | 'thinking' | 'wink' | 'exclaim';

export interface StateDef {
  morph: number;
  duration: number;
  blinkIn: boolean;
  ownBody: boolean;
  ownFace: boolean;
  frozenAt: number;
  pose: (local: number) => Pose;
}

const pair = (w: number, h: number): [EyeCfg, EyeCfg] => [
  { w, h, open: 1, tilt: 0 },
  { w, h, open: 1, tilt: 0 },
];

const base = (over: Partial<Pose> = {}): Pose => ({
  sil: circle(1),
  offX: 0,
  offY: 0,
  gaze: { ...REST_GAZE },
  split: EYE_SPLIT,
  eyes: pair(EYE_W, EYE_H),
  eyeAlpha: 1,
  dots: [],
  ...over,
});

const DOT_X = [-0.557, -0.013, 0.532] as const;
const DOT_R = 0.165;
const DOT_PEAK = 1.25;

const dotPulse = (t: number, index: number) => {
  const p = ((((t - index * 0.5) / 1.5) % 1) + 1) % 1;

  return clamp((p < 0.5 ? 0.5 - 0.5 * Math.cos(p * TAU) : 0) * 2);
};

const BAR_CY = -0.1875;

const BAR = profileFromPolygon(
  hullOfCircles({ x: 0, y: -0.505, r: 0.132 }, { x: 0, y: 0.13, r: 0.075 }),
  0,
  BAR_CY,
);

const thinking = (t: number) => {
  const emerge = 0.3 + 0.7 * easeOutCubic(clamp(t / 0.3));

  const side = (x: number, index: number): Dot => {
    const k = dotPulse(t, index);

    return { x: x * emerge, y: 0, r: DOT_R * (1 + (DOT_PEAK - 1) * k), opacity: 0.55 + 0.45 * k };
  };

  return base({
    sil: circle(DOT_R * (1 + (DOT_PEAK - 1) * dotPulse(t, 1)), { cx: DOT_X[1] }),
    eyeAlpha: 0,
    dots: [side(DOT_X[0], 0), side(DOT_X[2], 2)],
  });
};

export const STATES: Record<AvatarState, StateDef> = {
  idle: {
    duration: 2.4,
    morph: 0.45,
    blinkIn: false,
    ownBody: false,
    ownFace: false,
    frozenAt: 1,
    pose: () => base(),
  },
  thinking: {
    duration: 2.6,
    morph: 0.4,
    blinkIn: true,
    ownBody: true,
    ownFace: true,
    frozenAt: 1.1,
    pose: thinking,
  },
  wink: {
    duration: 1.6,
    morph: 0.3,
    blinkIn: true,
    ownBody: false,
    ownFace: true,
    frozenAt: 0.8,
    pose: () =>
      base({
        gaze: { yaw: -5.37, pitch: 4.55, roll: 6.7 },
        split: 16.25,
        eyes: [
          { w: 0.236, h: 0.464, open: 1, tilt: 0 },
          { w: 0.447, h: 0.089, open: 1, tilt: 0 },
        ],
      }),
  },
  exclaim: {
    duration: 2,
    morph: 0.45,
    blinkIn: false,
    ownBody: true,
    ownFace: true,
    frozenAt: 0.8,
    pose: () =>
      base({
        sil: { radii: BAR, rot: 0, cx: 0, cy: BAR_CY, sx: 1, sy: 1 },
        eyeAlpha: 0,
        dots: [{ x: -0.012, y: 0.526, r: 0.113, opacity: 1 }],
      }),
  },
};
