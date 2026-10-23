// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
export const TAU = Math.PI * 2

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export type Easing = (t: number) => number

/**
 * Mesure sur la video : les transitions sont des ease-out exponentiels, sans
 * depassement du corps. Les seuls effets de ressort sont locaux (le pop de la
 * pastille de notification, l'ouverture des yeux) et sont ecrits directement
 * dans l'etat concerne.
 */
export const easings = {
  easeOutCubic: (t: number) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  easeOutQuint: (t: number) => 1 - (1 - t) ** 5
} satisfies Record<string, Easing>

/** Bruit 1D periodique : boucle sans couture sur `period`, utile pour la derive du regard. */
export function loopNoise(t: number, period: number, seed = 0): number {
  const p = (t / period) * TAU
  return (
    0.55 * Math.sin(p + seed) +
    0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) +
    0.15 * Math.sin(3 * p + seed * 2.3 + 2.4)
  )
}

/** PRNG deterministe (mulberry32) : meme sequence a chaque lecture. */
export function createRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Arrondi court : divise par ~2 le poids des chaines de path generees a 60 fps. */
export const r2 = (v: number) => Math.round(v * 100) / 100
