import { BODIES, type AvatarBody } from './bodies';
import { EXPRESSIONS, type AvatarExpression } from './expressions';
import { DRIFT, eyePoses, type Face } from './face';
import { SCALE as R } from './math';
import { radiusAtAngle, toPoints, type Point, type Silhouette } from './outline';
import { STATES, type AvatarState, type Pose } from './poses';

interface Footprint {
  x: number;
  y: number;
  ax: number;
  ay: number;
  r: number;
  m: [number, number, number, number];
}

interface Trial {
  footprints: Footprint[];
  reference: Footprint[];
  outline: Point[];
  referenceOutline: Point[];
}

export interface Offset {
  x: number;
  y: number;
}

const ZERO: Offset = { x: 0, y: 0 };
const FLOAT = Math.hypot(DRIFT.x, DRIFT.y) * R;
const DIRECTIONS = 12;
const BISECTIONS = 8;

const footprints = (face: Face, sil: Silhouette, radii: number[]): Footprint[] => {
  const poses = eyePoses(face.gaze, R, face.split);

  return ([0, 1] as const).flatMap((i) => {
    const e = poses[i];
    const cfg = face.eyes[i];

    if (e.depth <= 0.02) return [];

    const phi = (cfg.tilt * Math.PI) / 180;
    const ax = e.a * Math.cos(phi) + e.c * Math.sin(phi);
    const ay = e.b * Math.cos(phi) + e.d * Math.sin(phi);
    const cx = -e.a * Math.sin(phi) + e.c * Math.cos(phi);
    const cy = -e.b * Math.sin(phi) + e.d * Math.cos(phi);
    const hw = Math.max(cfg.w * R, 0.01) / 2;
    const hh = Math.max(cfg.h * R, 0.01) / 2;
    const r = Math.min(hw, hh);
    const tall = hh > hw;
    const half = tall ? hh - r : hw - r;
    const fit = radiusAtAngle(radii, Math.atan2(e.y, e.x) - sil.rot);

    return [
      {
        x: e.x * fit,
        y: e.y * fit,
        ax: (tall ? cx : ax) * half,
        ay: (tall ? cy : ay) * half,
        r,
        m: [ax, ay, cx, cy],
      },
    ];
  });
};

const nearest = (pts: Point[], from: Point, to: Point) => {
  const sx = to.x - from.x;
  const sy = to.y - from.y;
  const len2 = sx * sx + sy * sy;

  const best = pts.reduce(
    (found, p) => {
      const t =
        len2 > 0 ? Math.min(1, Math.max(0, ((p.x - from.x) * sx + (p.y - from.y) * sy) / len2)) : 0;

      const ex = from.x + t * sx - p.x;
      const ey = from.y + t * sy - p.y;
      const d2 = ex * ex + ey * ey;

      return d2 < found.d2 ? { d2, vx: ex, vy: ey } : found;
    },
    { d2: Infinity, vx: 0, vy: 0 },
  );

  const d = Math.sqrt(best.d2);

  return { d, ux: d > 1e-9 ? best.vx / d : 0, uy: d > 1e-9 ? best.vy / d : 0 };
};

const worstMargin = (pts: Point[], prints: Footprint[], tx: number, ty: number) =>
  prints.reduce((margin, e) => {
    const x = e.x + tx;
    const y = e.y + ty;
    const a = nearest(pts, { x: x - e.ax, y: y - e.ay }, { x: x + e.ax, y: y + e.ay });
    const [m0, m1, m2, m3] = e.m;
    const radius = e.r * Math.hypot(m0 * a.ux + m1 * a.uy, m2 * a.ux + m3 * a.uy) + FLOAT;

    return Math.min(margin, a.d - radius);
  }, Infinity);

const searchDirection = (
  margin: (x: number, y: number) => number,
  angle: number,
  reach: number,
  target: number,
) => {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);

  if (margin(ux * reach, uy * reach) < target) {
    const tries = [0.3, 0.6, 1].map((k) => ({ x: ux * reach * k, y: uy * reach * k }));

    return { fits: null, fallback: tries.map((p) => ({ ...p, m: margin(p.x, p.y) })) };
  }

  let low = 0;
  let high = reach;

  for (let i = 0; i < BISECTIONS; i++) {
    const mid = (low + high) / 2;

    if (margin(ux * mid, uy * mid) >= target) high = mid;
    else low = mid;
  }

  return { fits: { x: ux * high, y: uy * high, norm: high }, fallback: [] };
};

const solve = (trials: Trial[]): Offset => {
  const [first] = trials;

  if (!first) return ZERO;

  const margin = (tx: number, ty: number) =>
    Math.min(...trials.map((trial) => worstMargin(trial.outline, trial.footprints, tx, ty)));

  const centre = first.footprints.reduce(
    (sum, e) => ({
      x: sum.x - e.x / first.footprints.length,
      y: sum.y - e.y / first.footprints.length,
    }),
    ZERO,
  );

  const reach = Math.max(0.35 * R, Math.hypot(centre.x, centre.y) * 1.25);

  const needed = Math.min(
    ...trials.map((trial) => worstMargin(trial.referenceOutline, trial.reference, 0, 0)),
    margin(centre.x, centre.y),
  );

  const start = margin(0, 0);

  if (start >= needed && start >= 0) return ZERO;

  const searches = Array.from({ length: DIRECTIONS }, (_, d) =>
    searchDirection(margin, (d / DIRECTIONS) * Math.PI * 2, reach, Math.max(needed, 0)),
  );

  const fits = searches.flatMap((s) => (s.fits ? [s.fits] : []));

  const shortest = fits.reduce<(typeof fits)[number] | null>(
    (a, b) => (a && a.norm <= b.norm ? a : b),
    null,
  );

  const fallback = searches
    .flatMap((s) => s.fallback)
    .reduce((a, b) => (b.m > a.m ? b : a), { x: 0, y: 0, m: start });

  const chosen = shortest ?? fallback;

  return { x: +(chosen.x / R).toFixed(6), y: +(chosen.y / R).toFixed(6) };
};

const signature = (p: Pose) =>
  JSON.stringify([p.gaze, p.split, p.eyes, p.sil.rot, p.sil.cx, p.sil.cy, p.sil.sx, p.sil.sy]);

const sampleTimes = (state: AvatarState) => {
  const def = STATES[state];

  if (signature(def.pose(0)) === signature(def.pose(def.duration))) return [0];

  return [0, def.duration / 2, def.duration];
};

const offsetFor = (state: AvatarState, radii: number[], expression: Face | null): Offset => {
  const def = STATES[state];

  const trials = sampleTimes(state).flatMap((t) => {
    const pose = def.pose(t);
    const outline = toPoints({ ...pose.sil, radii }, R);
    const referenceOutline = toPoints(pose.sil, R);
    const face = !def.ownFace && expression ? expression : pose;

    return [-DRIFT.yaw, DRIFT.yaw].flatMap((dy) =>
      [-DRIFT.pitch, DRIFT.pitch].map((dp) => {
        const corner = {
          ...face,
          gaze: { ...face.gaze, yaw: face.gaze.yaw + dy, pitch: face.gaze.pitch + dp },
        };

        return {
          footprints: footprints(corner, pose.sil, radii),
          reference: footprints(corner, pose.sil, pose.sil.radii),
          outline,
          referenceOutline,
        };
      }),
    );
  });

  return solve(trials);
};

const cache = new Map<string, Offset>();

export const eyeOffset = (
  state: AvatarState,
  body: AvatarBody,
  expression: AvatarExpression,
): Offset => {
  const { ownBody, ownFace } = STATES[state];

  if (ownBody) return ZERO;

  const key = `${state}|${body}|${ownFace ? '' : expression}`;
  const known = cache.get(key);

  if (known) return known;

  const offset = offsetFor(state, BODIES[body], ownFace ? null : EXPRESSIONS[expression]);

  cache.set(key, offset);

  return offset;
};
