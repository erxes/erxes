export const SCALE = 100;
export const HALF_VIEWBOX = 158;
export const TAU = Math.PI * 2;

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const r2 = (v: number) => Math.round(v * 100) / 100;
export const radians = (degrees: number) => (degrees * Math.PI) / 180;

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

export const cyclic = <T>(list: readonly T[], index: number): T => {
  const item = list[((index % list.length) + list.length) % list.length];

  if (item === undefined) throw new RangeError('cyclic() needs a non-empty list');

  return item;
};

export function loopNoise(t: number, period: number, seed = 0): number {
  const p = (t / period) * TAU;

  return (
    0.55 * Math.sin(p + seed) +
    0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) +
    0.15 * Math.sin(3 * p + seed * 2.3 + 2.4)
  );
}

export function createRng(seed: number) {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
