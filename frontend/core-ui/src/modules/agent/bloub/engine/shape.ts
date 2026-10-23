// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
import { TAU, lerp, r2 } from './math'
import { PROFILES, PROFILE_SAMPLES, type ProfileName } from './profiles'

export interface Point {
  x: number
  y: number
}

/**
 * Une silhouette = un profil radial r(theta) plus une pose.
 *
 * Tout passe par des profils echantillonnes au MEME nombre d'angles : deux
 * formes quelconques ont donc des points qui se correspondent un a un, et le
 * morphing se reduit a une interpolation lineaire des rayons. C'est ce qui
 * rend les transitions propres sans librairie de morphing de path.
 */
export interface Silhouette {
  radii: number[]
  /** rotation du profil, en radians */
  rot: number
  /** decalage du centre, en unites de rayon de boule */
  cx: number
  cy: number
  /** squash & stretch, applique en repere ecran (apres rotation) */
  sx: number
  sy: number
}

const ANGLES = Array.from({ length: PROFILE_SAMPLES }, (_, i) => (i / PROFILE_SAMPLES) * TAU)
const COS = ANGLES.map(Math.cos)
const SIN = ANGLES.map(Math.sin)

export function silhouette(name: ProfileName, pose: Partial<Silhouette> = {}): Silhouette {
  return {
    radii: [...PROFILES[name]],
    rot: 0,
    cx: 0,
    cy: 0,
    sx: 1,
    sy: 1,
    ...pose
  }
}

/** Cercle parfait : sert de base neutre (point, bulle, cible de fondu). */
export function circle(radius: number, pose: Partial<Silhouette> = {}): Silhouette {
  return {
    radii: new Array(PROFILE_SAMPLES).fill(radius),
    rot: 0,
    cx: 0,
    cy: 0,
    sx: 1,
    sy: 1,
    ...pose
  }
}

/** Interpolation de deux silhouettes. `out` est reutilise pour eviter d'allouer a 60 fps. */
export function blend(a: Silhouette, b: Silhouette, t: number, out?: Silhouette): Silhouette {
  const dst = out ?? { radii: new Array<number>(PROFILE_SAMPLES), rot: 0, cx: 0, cy: 0, sx: 1, sy: 1 }
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    dst.radii[i] = lerp(a.radii[i] ?? 1, b.radii[i] ?? 1, t)
  }
  // Rotation par le chemin le plus court : evite de faire un tour complet
  // quand on passe par exemple de +170deg a -170deg.
  let dRot = b.rot - a.rot
  while (dRot > Math.PI) dRot -= TAU
  while (dRot < -Math.PI) dRot += TAU
  dst.rot = a.rot + dRot * t
  dst.cx = lerp(a.cx, b.cx, t)
  dst.cy = lerp(a.cy, b.cy, t)
  dst.sx = lerp(a.sx, b.sx, t)
  dst.sy = lerp(a.sy, b.sy, t)
  return dst
}

/** Projette la silhouette en points ecran. `scale` = rayon de la boule en unites de viewBox. */
export function toPoints(s: Silhouette, scale: number, out: Point[] = []): Point[] {
  const cr = Math.cos(s.rot)
  const sr = Math.sin(s.rot)
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const r = s.radii[i] ?? 1
    const x = r * (COS[i] ?? 0)
    const y = r * (SIN[i] ?? 0)
    // rotation puis squash en repere ecran, puis translation
    const rx = x * cr - y * sr
    const ry = x * sr + y * cr
    const p = out[i] ?? { x: 0, y: 0 }
    p.x = (rx * s.sx + s.cx) * scale
    p.y = (ry * s.sy + s.cy) * scale
    out[i] = p
  }
  out.length = PROFILE_SAMPLES
  return out
}

/**
 * Polyligne fermee -> cubiques Catmull-Rom.
 *
 * Avec 64 points les tangentes centrees suffisent largement : le contour est
 * lisse au pixel pres meme affiche en 600 px, et la chaine reste courte.
 */
export function closedPath(pts: Point[], tension = 1 / 6): string {
  const n = pts.length
  if (n < 3) return ''
  const first = pts[0]!
  let d = `M${r2(first.x)} ${r2(first.y)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!
    const p1 = pts[i]!
    const p2 = pts[(i + 1) % n]!
    const p3 = pts[(i + 2) % n]!
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2.x)} ${r2(p2.y)}`
  }
  return `${d}Z`
}

/**
 * Polygone quelconque -> profil radial, par lancer de rayon depuis `center`.
 *
 * Sert a fabriquer les formes qui ne s'expriment pas naturellement en r(theta)
 * (la barre tronconique du "!"). Calcule une seule fois au chargement, jamais
 * dans la boucle de rendu.
 */
export function profileFromPolygon(poly: Point[], cx: number, cy: number): number[] {
  const radii = new Array<number>(PROFILE_SAMPLES).fill(0)
  const n = poly.length
  for (let k = 0; k < PROFILE_SAMPLES; k++) {
    const dx = COS[k] ?? 0
    const dy = SIN[k] ?? 0
    let best = 0
    for (let i = 0; i < n; i++) {
      const a = poly[i]!
      const b = poly[(i + 1) % n]!
      const ex = b.x - a.x
      const ey = b.y - a.y
      const den = dx * ey - dy * ex
      if (Math.abs(den) < 1e-9) continue
      const px = a.x - cx
      const py = a.y - cy
      const t = (px * ey - py * ex) / den // distance le long du rayon
      const u = (px * dy - py * dx) / den // position sur le segment
      if (t > best && u >= 0 && u <= 1) best = t
    }
    radii[k] = best
  }
  return radii
}

/** Enveloppe convexe de deux cercles : la barre tronconique du "!" vertical. */
export function hullOfCircles(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2v: number,
  steps = 96
): Point[] {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy) || 1e-6
  // angle des tangentes externes communes
  const base = Math.atan2(dy, dx)
  const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2v) / dist)))
  const pts: Point[] = []
  // arc du grand cercle
  for (let i = 0; i <= steps / 2; i++) {
    const a = base + spread + ((TAU - 2 * spread) * i) / (steps / 2)
    pts.push({ x: x1 + Math.cos(a) * r1, y: y1 + Math.sin(a) * r1 })
  }
  // arc du petit cercle
  for (let i = 0; i <= steps / 2; i++) {
    const a = base - spread + ((2 * spread) * i) / (steps / 2)
    pts.push({ x: x2 + Math.cos(a) * r2v, y: y2 + Math.sin(a) * r2v })
  }
  return pts
}

/**
 * Rayon du profil dans une direction quelconque, par interpolation entre les
 * deux echantillons voisins.
 *
 * Sert a recaler ce qui est pose "sur" le corps (les yeux, la pastille de
 * notification) quand la silhouette n'est plus un cercle : sans ca, un oeil
 * place a 0.62 rayon sort d'une forme dont le bord est a 0.55 dans cette
 * direction, et le masque le rogne.
 */
export function radiusAtAngle(radii: number[], angle: number): number {
  const n = radii.length
  const t = ((((angle / TAU) % 1) + 1) % 1) * n
  const i = Math.floor(t)
  return lerp(radii[i % n] ?? 1, radii[(i + 1) % n] ?? 1, t - i)
}

/**
 * Superellipse : |x/sx|^n + |y/sy|^n = 1.
 * n = 2 donne une ellipse, n ~ 4 le squircle du personnalisateur.
 */
export function superellipseProfile(n: number, sx = 1, sy = 1): number[] {
  return ANGLES.map((_, i) => {
    const c = Math.abs((COS[i] ?? 0) / sx) ** n
    const s = Math.abs((SIN[i] ?? 0) / sy) ** n
    return (c + s) ** (-1 / n)
  })
}

/**
 * Profil radial de l'UNION de disques : r(theta) = la plus lointaine des
 * intersections rayon/cercle. Exact tant que l'origine est dans l'union — c'est
 * ce qui donne les bosses du nuage sans booleen de path.
 */
export function unionOfCirclesProfile(circles: Array<{ x: number; y: number; r: number }>): number[] {
  const out = new Array<number>(PROFILE_SAMPLES).fill(0)
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const dx = COS[i] ?? 0
    const dy = SIN[i] ?? 0
    let best = 0
    for (const c of circles) {
      const b = dx * c.x + dy * c.y
      const disc = b * b - (c.x * c.x + c.y * c.y - c.r * c.r)
      if (disc < 0) continue
      const t = b + Math.sqrt(disc)
      if (t > best) best = t
    }
    out[i] = best
  }
  return out
}

/**
 * Polygone a coins arrondis, par somme de Minkowski avec un disque : chaque
 * arete est poussee de `rc` vers l'exterieur, chaque sommet devient un arc de
 * rayon `rc`. Les sommets sont donc a poser au rayon voulu MOINS rc.
 * Attend un polygone en sens horaire (repere ecran, y vers le bas).
 */
function roundedPolygon(verts: Point[], rc: number, arcSteps = 10): Point[] {
  const n = verts.length
  const out: Point[] = []
  const normal = (a: Point, b: Point) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    // sens horaire + y vers le bas : la normale sortante est (dy, -dx)
    return Math.atan2(-dx / len, dy / len)
  }
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n]!
    const cur = verts[i]!
    const next = verts[(i + 1) % n]!
    const a0 = normal(prev, cur)
    const a1 = normal(cur, next)
    let d = a1 - a0
    while (d > Math.PI) d -= TAU
    while (d < -Math.PI) d += TAU
    for (let k = 0; k <= arcSteps; k++) {
      const a = a0 + (d * k) / arcSteps
      out.push({ x: cur.x + Math.cos(a) * rc, y: cur.y + Math.sin(a) * rc })
    }
  }
  return out
}

/** Polygone regulier a coins arrondis, inscrit dans `radius`. */
export function regularPolygonProfile(
  sides: number,
  radius: number,
  rc: number,
  rotationDeg = 0
): number[] {
  const rot = (rotationDeg * Math.PI) / 180
  const verts = Array.from({ length: sides }, (_, i) => {
    // sens horaire a l'ecran : theta croissant avec y vers le bas
    const a = rot + (i / sides) * TAU
    return { x: Math.cos(a) * (radius - rc), y: Math.sin(a) * (radius - rc) }
  })
  return profileFromPolygon(roundedPolygon(verts, rc), 0, 0)
}

/** Polyligne fermee exacte : garde les segments droits (contrairement a closedPath). */
export function polyPath(pts: Point[], scale = 1): string {
  if (pts.length < 3) return ''
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    d += `${i === 0 ? 'M' : 'L'}${r2(p.x * scale)} ${r2(p.y * scale)}`
  }
  return `${d}Z`
}

/** Capsule (stade) centree sur l'origine : la forme exacte des yeux du bot. */
export function capsulePath(w: number, h: number): string {
  const hw = Math.max(w, 0.01) / 2
  const hh = Math.max(h, 0.01) / 2
  const r = Math.min(hw, hh)
  return (
    `M${r2(-hw)} ${r2(-hh + r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw + r)} ${r2(-hh)}` +
    `L${r2(hw - r)} ${r2(-hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw)} ${r2(-hh + r)}` +
    `L${r2(hw)} ${r2(hh - r)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw - r)} ${r2(hh)}` +
    `L${r2(-hw + r)} ${r2(hh)}` +
    `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw)} ${r2(hh - r)}Z`
  )
}
