import { clamp, createRng, loopNoise, radians } from './math';

type Vec3 = [number, number, number];

export const EYE_SPLIT = 15.46;
export const EYE_W = 0.186;
export const EYE_H = 0.412;

export interface HeadGaze {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface EyeCfg {
  w: number;
  h: number;
  open: number;
  tilt: number;
}

export interface Face {
  gaze: HeadGaze;
  split: number;
  eyes: [EyeCfg, EyeCfg];
}

export const REST_GAZE: HeadGaze = { yaw: 28.49, pitch: 28.62, roll: -13 };

export interface EyePose {
  x: number;
  y: number;
  a: number;
  b: number;
  c: number;
  d: number;
  depth: number;
}

const spin = (u: Vec3, v: Vec3, angle: number): [Vec3, Vec3] => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return [
    [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s],
    [v[0] * c - u[0] * s, v[1] * c - u[1] * s, v[2] * c - u[2] * s],
  ];
};

export const eyePoses = (gaze: HeadGaze, scale: number, split: number): [EyePose, EyePose] => {
  const [f1, right1] = spin([0, 0, 1], [1, 0, 0], radians(gaze.yaw));
  const [down1, forward] = spin([0, 1, 0], f1, radians(gaze.pitch));
  const [right, down] = spin(right1, down1, radians(gaze.roll));

  const build = (side: number): EyePose => {
    const [ef, er] = spin(forward, right, radians(split * side));

    return {
      x: ef[0] * scale,
      y: ef[1] * scale,
      a: er[0],
      b: er[1],
      c: down[0],
      d: down[1],
      depth: ef[2],
    };
  };

  return [build(-1), build(1)];
};

const BLINKS: number[] = (() => {
  const rng = createRng(0x5eed);
  const out: number[] = [];
  let t = 1.4;

  while (t < 900) {
    out.push(t);
    t += 1.9 + rng() * 2.7;

    if (rng() < 0.18) {
      out.push(t);
      t += 0.24;
    }
  }

  return out;
})();

const BLINK_DUR = 0.18;

const blinkLid = (t: number) => {
  const start = BLINKS.findLast((at) => at <= t);
  const k = start === undefined ? 2 : (t - start) / BLINK_DUR;

  if (k > 1) return 1;

  return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
};

export const DRIFT = { yaw: 5.5 + 1.6, pitch: 4.2 + 1.3, x: 0.006, y: 0.007 };

export const liveliness = (t: number, wander: number, blink: boolean) => ({
  dYaw: (loopNoise(t, 11.3, 0.4) * 5.5 + loopNoise(t, 3.7, 2.1) * 1.6) * wander,
  dPitch: (loopNoise(t, 9.1, 1.3) * 4.2 + loopNoise(t, 4.3, 0.7) * 1.3) * wander,
  dRoll: loopNoise(t, 13.7, 3.2) * 2.2 * wander,
  lid: blink ? blinkLid(t) : 1,
  driftX: loopNoise(t, 7.9, 1.9) * DRIFT.x,
  driftY: loopNoise(t, 5.3, 0.3) * DRIFT.y,
  breath: 1 + Math.sin((t / 3.4) * Math.PI * 2) * 0.005,
});

export const blinkScale = (lid: number) => 0.06 + 0.94 * clamp(lid);
