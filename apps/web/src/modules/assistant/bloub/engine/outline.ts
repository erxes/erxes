import { TAU, cyclic, lerp, r2 } from './math';

export interface Point {
  x: number;
  y: number;
}

export interface Silhouette {
  radii: number[];
  rot: number;
  cx: number;
  cy: number;
  sx: number;
  sy: number;
}

export const SAMPLES = 64;

const UNIT: Point[] = Array.from({ length: SAMPLES }, (_, i) => {
  const angle = (i / SAMPLES) * TAU;

  return { x: Math.cos(angle), y: Math.sin(angle) };
});

const wrapAngle = (angle: number) => {
  let wrapped = angle;

  while (wrapped > Math.PI) wrapped -= TAU;

  while (wrapped < -Math.PI) wrapped += TAU;

  return wrapped;
};

export const filled = (radius: number) => Array.from({ length: SAMPLES }, () => radius);

export const circle = (radius: number, pose: Partial<Silhouette> = {}): Silhouette => ({
  radii: filled(radius),
  rot: 0,
  cx: 0,
  cy: 0,
  sx: 1,
  sy: 1,
  ...pose,
});

export const blend = (a: Silhouette, b: Silhouette, t: number): Silhouette => ({
  radii: UNIT.map((_, i) => lerp(a.radii[i] ?? 1, b.radii[i] ?? 1, t)),
  rot: a.rot + wrapAngle(b.rot - a.rot) * t,
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  sx: lerp(a.sx, b.sx, t),
  sy: lerp(a.sy, b.sy, t),
});

export const toPoints = (s: Silhouette, scale: number): Point[] => {
  const cr = Math.cos(s.rot);
  const sr = Math.sin(s.rot);

  return UNIT.map((unit, i) => {
    const r = s.radii[i] ?? 1;
    const x = r * unit.x;
    const y = r * unit.y;

    return {
      x: ((x * cr - y * sr) * s.sx + s.cx) * scale,
      y: ((x * sr + y * cr) * s.sy + s.cy) * scale,
    };
  });
};

export const closedPath = (pts: Point[], tension = 1 / 6): string => {
  const [first] = pts;

  if (!first || pts.length < 3) return '';

  const curves = pts.map((p1, i) => {
    const p0 = cyclic(pts, i - 1);
    const p2 = cyclic(pts, i + 1);
    const p3 = cyclic(pts, i + 2);
    const c1 = `${r2(p1.x + (p2.x - p0.x) * tension)} ${r2(p1.y + (p2.y - p0.y) * tension)}`;
    const c2 = `${r2(p2.x - (p3.x - p1.x) * tension)} ${r2(p2.y - (p3.y - p1.y) * tension)}`;

    return `C${c1} ${c2} ${r2(p2.x)} ${r2(p2.y)}`;
  });

  return `M${r2(first.x)} ${r2(first.y)}${curves.join('')}Z`;
};

const rayToPolygon = (poly: Point[], direction: Point, cx: number, cy: number) =>
  poly.reduce((best, a, i) => {
    const b = cyclic(poly, i + 1);
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const den = direction.x * ey - direction.y * ex;

    if (Math.abs(den) < 1e-9) return best;

    const px = a.x - cx;
    const py = a.y - cy;
    const t = (px * ey - py * ex) / den;
    const u = (px * direction.y - py * direction.x) / den;

    return t > best && u >= 0 && u <= 1 ? t : best;
  }, 0);

export const profileFromPolygon = (poly: Point[], cx = 0, cy = 0): number[] =>
  UNIT.map((direction) => rayToPolygon(poly, direction, cx, cy));

export const hullOfCircles = (
  from: { x: number; y: number; r: number },
  to: { x: number; y: number; r: number },
  steps = 96,
): Point[] => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1e-6;
  const base = Math.atan2(dy, dx);
  const spread = Math.acos(Math.max(-1, Math.min(1, (from.r - to.r) / dist)));
  const half = steps / 2;

  const arc = (c: { x: number; y: number; r: number }, start: number, sweep: number) =>
    Array.from({ length: half + 1 }, (_, i) => {
      const a = start + (sweep * i) / half;

      return { x: c.x + Math.cos(a) * c.r, y: c.y + Math.sin(a) * c.r };
    });

  return [...arc(from, base + spread, TAU - 2 * spread), ...arc(to, base - spread, 2 * spread)];
};

export const radiusAtAngle = (radii: number[], angle: number): number => {
  const n = radii.length;
  const t = ((((angle / TAU) % 1) + 1) % 1) * n;
  const i = Math.floor(t);

  return lerp(radii[i % n] ?? 1, radii[(i + 1) % n] ?? 1, t - i);
};

export const superellipseProfile = (n: number): number[] =>
  UNIT.map((unit) => (Math.abs(unit.x) ** n + Math.abs(unit.y) ** n) ** (-1 / n));

export const unionOfCirclesProfile = (circles: { x: number; y: number; r: number }[]) =>
  UNIT.map((unit) =>
    circles.reduce((best, c) => {
      const b = unit.x * c.x + unit.y * c.y;
      const disc = b * b - (c.x * c.x + c.y * c.y - c.r * c.r);

      return disc < 0 ? best : Math.max(best, b + Math.sqrt(disc));
    }, 0),
  );

const roundedPolygon = (verts: Point[], rc: number, arcSteps = 10): Point[] => {
  const normal = (a: Point, b: Point) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;

    return Math.atan2(-(b.x - a.x) / len, (b.y - a.y) / len);
  };

  return verts.flatMap((cur, i) => {
    const a0 = normal(cyclic(verts, i - 1), cur);
    const d = wrapAngle(normal(cur, cyclic(verts, i + 1)) - a0);

    return Array.from({ length: arcSteps + 1 }, (_, k) => {
      const a = a0 + (d * k) / arcSteps;

      return { x: cur.x + Math.cos(a) * rc, y: cur.y + Math.sin(a) * rc };
    });
  });
};

export const regularPolygonProfile = (
  sides: number,
  radius: number,
  rc: number,
  rotationDeg = 0,
): number[] => {
  const rot = (rotationDeg * Math.PI) / 180;

  const verts = Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * TAU;

    return { x: Math.cos(a) * (radius - rc), y: Math.sin(a) * (radius - rc) };
  });

  return profileFromPolygon(roundedPolygon(verts, rc));
};

export const capsulePath = (w: number, h: number): string => {
  const hw = Math.max(w, 0.01) / 2;
  const hh = Math.max(h, 0.01) / 2;
  const r = r2(Math.min(hw, hh));
  const corner = `A${r} ${r} 0 0 1`;

  return [
    `M${r2(-hw)} ${r2(-hh + r)}`,
    `${corner} ${r2(-hw + r)} ${r2(-hh)}`,
    `L${r2(hw - r)} ${r2(-hh)}`,
    `${corner} ${r2(hw)} ${r2(-hh + r)}`,
    `L${r2(hw)} ${r2(hh - r)}`,
    `${corner} ${r2(hw - r)} ${r2(hh)}`,
    `L${r2(-hw + r)} ${r2(hh)}`,
    `${corner} ${r2(-hw)} ${r2(hh - r)}Z`,
  ].join('');
};
