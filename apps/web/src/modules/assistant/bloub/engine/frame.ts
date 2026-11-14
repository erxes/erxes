import { blendFace } from './expressions';
import { blinkScale, eyePoses, type HeadGaze } from './face';
import { lerp, r2 } from './math';
import { blend, capsulePath, closedPath, radiusAtAngle, toPoints } from './outline';
import type { Dot, Pose } from './poses';

interface RenderedEye {
  d: string;
  matrix: string;
  alpha: number;
}

export interface BotFrame {
  bodyPath: string;
  eyes: RenderedEye[];
  dots: Dot[];
}

export interface Look {
  yaw: number;
  pitch: number;
  mix: number;
  wander: number;
}

export const NO_LOOK: Look = { yaw: 0, pitch: 0, mix: 0, wander: 1 };

export const lerpLook = (a: Look, b: Look, t: number): Look => ({
  yaw: lerp(a.yaw, b.yaw, t),
  pitch: lerp(a.pitch, b.pitch, t),
  mix: lerp(a.mix, b.mix, t),
  wander: lerp(a.wander, b.wander, t),
});

export const blendPose = (a: Pose, b: Pose, t: number): Pose => ({
  ...blendFace(a, b, t),
  sil: blend(a.sil, b.sil, t),
  offX: lerp(a.offX, b.offX, t),
  offY: lerp(a.offY, b.offY, t),
  eyeAlpha: lerp(a.eyeAlpha, b.eyeAlpha, t),
  dots: [
    ...a.dots.map((d) => ({ ...d, opacity: d.opacity * (1 - t) })),
    ...b.dots.map((d) => ({ ...d, opacity: d.opacity * t })),
  ],
});

export interface FrameInput {
  pose: Pose;
  gaze: HeadGaze;
  lid: number;
  offX: number;
  offY: number;
  breath: number;
  eyeShift: { x: number; y: number };
  scale: number;
}

const renderEyes = ({ pose, gaze, lid, offX, offY, eyeShift, scale }: FrameInput) => {
  if (pose.eyeAlpha <= 0.01) return [];

  const poses = eyePoses(gaze, scale, pose.split);

  return ([0, 1] as const).flatMap((i): RenderedEye[] => {
    const e = poses[i];
    const cfg = pose.eyes[i];

    if (e.depth <= 0.02) return [];

    const fit = radiusAtAngle(pose.sil.radii, Math.atan2(e.y, e.x) - pose.sil.rot);
    const phi = (cfg.tilt * Math.PI) / 180;
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    const k = blinkScale(Math.min(lid, cfg.open));

    const matrix = [
      e.a * cp + e.c * sp,
      (e.b * cp + e.d * sp) * k,
      -e.a * sp + e.c * cp,
      (-e.b * sp + e.d * cp) * k,
      e.x * fit + (offX + eyeShift.x) * scale,
      e.y * fit + (offY + eyeShift.y) * scale,
    ];

    return [
      {
        d: capsulePath(cfg.w * scale, cfg.h * scale),
        matrix: `matrix(${matrix.map(r2).join(',')})`,
        alpha: pose.eyeAlpha * Math.min(1, Math.max(0, e.depth / 0.12)),
      },
    ];
  });
};

export const buildFrame = (input: FrameInput): BotFrame => {
  const { pose, offX, offY, breath, scale } = input;

  const sil = {
    ...pose.sil,
    cx: pose.sil.cx + offX,
    cy: pose.sil.cy + offY,
    sy: pose.sil.sy * breath,
  };

  return {
    bodyPath: closedPath(toPoints(sil, scale)),
    eyes: renderEyes(input),
    dots: pose.dots
      .filter((p) => p.opacity > 0.01 && p.r > 0.0005)
      .map((p) => ({ ...p, x: (p.x + offX) * scale, y: (p.y + offY) * scale, r: p.r * scale })),
  };
};
