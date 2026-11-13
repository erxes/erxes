// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
/**
 * Ou poser le visage sur une forme du personnalisateur.
 *
 * Les yeux vivent sur une sphere, et `radiusAtAngle` les recolle au contour reel au
 * prorata du rayon local. Ce prorata place bien leur CENTRE, mais l'oeil a une taille :
 * la marge qui lui reste devant le bord est multipliee par le meme facteur, donc une
 * silhouette etroite dans sa direction le pousse contre le bord jusqu'a ce que le
 * masque l'ouvre vers l'exterieur. La gelule apparaissait comme une encoche dans le
 * corps sur `capsule`, `triangle`, `nuage` et `goutte`.
 *
 * Ce module resout le probleme UNE FOIS, au chargement, et rend une table de decalages.
 * Ce choix est l'essentiel du correctif, bien plus que la geometrie qui suit :
 *
 * Resolue dans la boucle de rendu, la correction reagit a tout ce qui bouge a soixante
 * images par seconde — la derive du regard, le pointeur, l'expression en cours de
 * morph, le bord le plus proche qui change, l'oeil le plus contraint qui change. Sept
 * variantes ont ete ecrites ainsi et toutes produisaient un artefact de mouvement
 * visible : tremblement permanent, saut de direction de 26 unites quand le bord de
 * reference basculait, grossissement brusque quand la taille entrait dans le calcul.
 * Le defaut n'etait dans aucune de leurs geometries, il etait dans le fait de resoudre
 * par image.
 *
 * Le reste du moteur ne travaille pas comme ca : les poses sont DECLAREES et il ne fait
 * que les interpoler avec des courbes connues. Un decalage tabule rentre dans ce moule.
 * Il ne bouge pas quand le regard derive ni quand le pointeur bouge, et sur un changement
 * de forme ou d'expression il ne fait qu'aller d'une entree de table a l'autre, sur la
 * courbe de ce morph. Le tremblement devient impossible par construction, au lieu d'etre
 * repousse : interpoler entre deux constantes est monotone, alors que re-resoudre le
 * probleme sur un regard en cours d'interpolation ne l'est pas.
 *
 * Corollaire agreable : le solveur n'a plus aucune contrainte de continuite, puisqu'il ne
 * tourne pas pendant l'animation. Il peut donc sonder tout un faisceau de directions et
 * couvrir le pire cas de la derive du regard, ce qu'une version par image ne pouvait pas
 * se permettre.
 *
 * La table est une constante de module, batie a l'import a partir de donnees pures :
 * meme nature que le calendrier de clignements de `face.ts`, deterministe et sans etat,
 * donc sans effet sur la purete de `engine.sample(t)`.
 */

import { EXPRESSIONS, type BotExpression } from './expressions'
import { eyePoses } from './face'
import { radiusAtAngle, toPoints, type Point } from './shape'
import { SHAPES } from './skins'
import { STATES, type Pose, type StateDef, type StateId } from './states'

/** Rayon de reference du solveur. Le decalage rendu est en unites de ce rayon. */
const R = 100

/**
 * Amplitudes maximales de la vie au repos, lues sur `liveliness` : `loopNoise` est
 * borne a 1 en valeur absolue, donc ces sommes sont des bornes exactes et non des
 * estimations.
 *
 * Il faut les couvrir, sinon la correction est juste sur la pose nominale et fausse une
 * seconde plus tard : 7 degres de lacet deplacent l'oeil d'une douzaine d'unites sur une
 * boule de rayon 100. C'est precisement ce qui faisait deborder `capsule` + `effraye`
 * alors qu'une mesure a un seul instant le declarait bon.
 */
const DERIVE_YAW = 5.5 + 1.6
const DERIVE_PITCH = 4.2 + 1.3
/** Flottement du centre, en unites de rayon de boule. */
const DERIVE_X = 0.006
const DERIVE_Y = 0.007

/** Le visage d'une pose, ce dont le solveur a besoin pour placer ses gelules. */
interface Visage {
  gaze: Pose['gaze']
  split: number
  eyes: Pose['eyes']
}

/**
 * Une gelule prete a etre mesuree : le segment de son axe, et de quoi calculer le rayon
 * a degager DANS UNE DIRECTION donnee.
 *
 * Une gelule est exactement un segment epaissi d'un disque de rayon `r`. Son image par la
 * matrice tangente est donc un segment epaissi d'une ELLIPSE, et le rayon a degager
 * depend de la direction : c'est la fonction d'appui de cette ellipse, `r * |A^T u|`.
 *
 * Prendre a la place sa plus grande valeur singuliere serait conservateur mais faux dans
 * la seule direction qui compte, et ca se paie cher : la marge de reference sur le cercle
 * ressortait NEGATIVE, donc la demande devenait sans dents et 34 combinaisons
 * continuaient de deborder.
 */
interface Empreinte {
  /** centre, en unites de viewBox */
  x: number
  y: number
  /** demi-vecteur de l'axe */
  ax: number
  ay: number
  /** rayon du disque local, avant transformation */
  r: number
  /** colonnes de la matrice tangente, pour la fonction d'appui */
  m: [number, number, number, number]
}

/**
 * Empreintes des deux yeux d'un visage, posees sur un profil.
 *
 * Une gelule est exactement un segment epaissi d'un disque de rayon `r`. Son image par
 * la matrice tangente est donc un segment epaissi d'une ELLIPSE, et un disque du rayon
 * de son grand axe la couvre : d'ou la plus grande valeur singuliere. La mesure reste
 * ainsi conservatrice au sens strict, une marge positive garantissant que la gelule est
 * dedans.
 *
 * Le clignement n'y est pas : un oeil ferme n'a pas besoin qu'on lui fasse de la place.
 */
function empreintes(visage: Visage, sil: Pose['sil'], radii: number[]): Empreinte[] {
  const out: Empreinte[] = []
  const poses = eyePoses(visage.gaze, R, visage.split)
  for (let i = 0; i < 2; i++) {
    const e = poses[i]!
    if (e.depth <= 0.02) continue
    const cfg = visage.eyes[i]!
    const phi = ((cfg.tilt ?? 0) * Math.PI) / 180
    const cp = Math.cos(phi)
    const sp = Math.sin(phi)
    const ax = e.a * cp + e.c * sp
    const ay = e.b * cp + e.d * sp
    const cx = -e.a * sp + e.c * cp
    const cy = -e.b * sp + e.d * cp

    const hw = Math.max(cfg.w * R, 0.01) / 2
    const hh = Math.max(cfg.h * R, 0.01) / 2
    const r = Math.min(hw, hh)
    // l'axe est celui de la plus grande dimension
    const long = hh > hw
    const demi = long ? hh - r : hw - r
    // le prorata du rayon local, exactement comme le fait le moteur
    const fit = radiusAtAngle(radii, Math.atan2(e.y, e.x) - sil.rot)
    out.push({
      x: e.x * fit,
      y: e.y * fit,
      ax: (long ? cx : ax) * demi,
      ay: (long ? cy : ay) * demi,
      r,
      m: [ax, ay, cx, cy]
    })
  }
  return out
}

/**
 * Approche la plus courte entre un contour et un segment : la distance, et le vecteur
 * qui va du contour vers le segment — le sens qui degage.
 *
 * Les deux sortent de la MEME passe. Les calculer separement doublait le seul vrai cout
 * de ce module, qui est ce balayage.
 */
function approche(pts: Point[], x0: number, y0: number, x1: number, y1: number) {
  const sx = x1 - x0
  const sy = y1 - y0
  const len2 = sx * sx + sy * sy
  let best = Infinity
  let vx = 0
  let vy = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    let t = len2 > 0 ? ((p.x - x0) * sx + (p.y - y0) * sy) / len2 : 0
    t = t < 0 ? 0 : t > 1 ? 1 : t
    const ex = x0 + t * sx - p.x
    const ey = y0 + t * sy - p.y
    const d2 = ex * ex + ey * ey
    if (d2 < best) {
      best = d2
      vx = ex
      vy = ey
    }
  }
  const d = Math.sqrt(best)
  return { d, ux: d > 1e-9 ? vx / d : 0, uy: d > 1e-9 ? vy / d : 0 }
}

/** Une epreuve : des gelules a faire tenir dans un contour, et le contour de reference. */
interface Epreuve {
  empreintes: Empreinte[]
  reference: Empreinte[]
  contour: Point[]
  calContour: Point[]
}

/**
 * Flottement du centre au repos, en unites de viewBox. Il est ajoute au rayon de la
 * gelule : moins d'une unite, donc l'absorber ainsi coute moins cher que de multiplier les
 * epreuves par ses quatre coins.
 */
const FLOTTEMENT = Math.hypot(DERIVE_X, DERIVE_Y) * R

/** Marge de la gelule la plus serree, et le sens qui la degage. */
function pire(pts: Point[], emps: Empreinte[], tx: number, ty: number) {
  let marge = Infinity
  let ux = 0
  let uy = 0
  for (const e of emps) {
    const x = e.x + tx
    const y = e.y + ty
    const a = approche(pts, x - e.ax, y - e.ay, x + e.ax, y + e.ay)
    // fonction d'appui de l'ellipse dans la direction de l'approche
    const [m0, m1, m2, m3] = e.m
    const rayon =
      e.r * Math.hypot(m0 * a.ux + m1 * a.uy, m2 * a.ux + m3 * a.uy) + FLOTTEMENT
    if (a.d - rayon < marge) {
      marge = a.d - rayon
      ux = a.ux
      uy = a.uy
    }
  }
  return { marge, ux, uy }
}

/**
 * Directions sondees et pas de la dichotomie. Le produit des deux est le cout de
 * construction de la table, seul chiffre a surveiller ici.
 */
const DIRECTIONS = 12
const DICHOTOMIE = 8

/**
 * Le decalage a poser sur les deux yeux pour cette forme, cet etat et cette expression.
 *
 * Une TRANSLATION commune aux deux yeux, donc une isometrie : ecart entre les yeux,
 * tailles et inclinaisons sont conserves au pixel. Le visage est seulement pose un peu
 * plus bas sur un corps qui n'a pas de place en haut, ce qui est le geste qu'on ferait a
 * la main. Les variantes qui bornaient chaque oeil separement ecartaient la paire, et
 * celles qui mettaient le visage a l'echelle rapetissaient les yeux — visiblement.
 *
 * La marge visee est celle du profil D'ORIGINE, pas un degagement strict : sur le cercle
 * l'oeil exterieur frole deja le bord, 17,3 unites pour une boule de rayon 100, et c'est
 * voulu, c'est ce qui donne le volume. Elle est plafonnee par ce que la forme offre en son
 * centre, sinon la demande est intenable sur un corps plat.
 *
 * RECHERCHE DIRECTIONNELLE et non descente. On cherche la translation de plus petite
 * norme qui tient, donc on sonde une couronne de directions et on dichotomie la distance
 * le long de chacune. Une descente de gradient a ete ecrite d'abord et elle ne converge
 * pas : degager la paire d'un bord la rapproche de l'autre, si bien qu'elle tatonne et ne
 * fait que garder son meilleur essai — passer ses tours de 40 a 18 suffisait a faire
 * reapparaitre 34 debordements. Ici le resultat ne depend pas d'une convergence : chaque
 * direction est resolue exactement, au pas de dichotomie pres.
 */
function resous(epreuves: Epreuve[]): { x: number; y: number } {
  if (!epreuves.length) return { x: 0, y: 0 }

  /** La marge la plus serree sur toutes les epreuves, pour une translation donnee. */
  const marge = (tx: number, ty: number) => {
    let m = Infinity
    for (const ep of epreuves) m = Math.min(m, pire(ep.contour, ep.empreintes, tx, ty).marge)
    return m
  }

  // Marge exigee : la plus serree que le profil d'origine tolere, sur toutes les
  // epreuves. Puis plafonnee par le plus degage que la forme puisse offrir a la paire,
  // son centre.
  let requis = Infinity
  for (const ep of epreuves) {
    requis = Math.min(requis, pire(ep.calContour, ep.reference, 0, 0).marge)
  }
  /*
   * La course doit pouvoir atteindre le centre du corps : `wide` a des gelules de 87
   * unites de long, et sur un triangle elles ne tiennent que vers le milieu, a une
   * cinquantaine d'unites de leur place nominale. Une course fixe les laissait dehors.
   */
  let mx = 0
  let my = 0
  const emps = epreuves[0]!.empreintes
  for (const e of emps) {
    mx -= e.x / emps.length
    my -= e.y / emps.length
  }
  const course = Math.max(0.35 * R, Math.hypot(mx, my) * 1.25)

  // Plafond de la demande : ce que la forme offre en son centre, toujours atteignable.
  requis = Math.min(requis, marge(mx, my))

  /*
   * Deja bon : le cas du cercle, et de toute forme assez large. La gelule doit RENTRER
   * en plus de n'etre pas plus serree que sur le profil d'origine — sans cette seconde
   * condition, une forme ou rien ne rentre satisfait la premiere de facon degeneree et
   * on abandonnait. `wide` a des gelules de 87 unites de long, `notify` de 50 de
   * diametre : sur un triangle ou une goutte elles debordent quoi qu'on fasse, et il
   * faut alors viser le moins pire, pas renoncer.
   */
  const depart = marge(0, 0)
  if (depart >= requis && depart >= 0) return { x: 0, y: 0 }
  const cible = Math.max(requis, 0)

  let meilleurX = 0
  let meilleurY = 0
  let meilleureNorme = Infinity
  // repli quand rien ne rentre : la translation qui degage le plus, sondee au passage
  let secoursX = 0
  let secoursY = 0
  let secours = depart

  for (let d = 0; d < DIRECTIONS; d++) {
    const a = (d / DIRECTIONS) * Math.PI * 2
    const ux = Math.cos(a)
    const uy = Math.sin(a)
    if (marge(ux * course, uy * course) < cible) {
      // cette direction ne mene nulle part ; on garde quand meme le meilleur degagement
      // pas de solution par la, mais peut-etre un meilleur degagement
      for (const k of [0.3, 0.6, 1]) {
        const m = marge(ux * course * k, uy * course * k)
        if (m > secours) {
          secours = m
          secoursX = ux * course * k
          secoursY = uy * course * k
        }
      }
      continue
    }
    // la plus courte distance qui tient, le long de cette direction
    let bas = 0
    let haut = course
    for (let i = 0; i < DICHOTOMIE; i++) {
      const mid = (bas + haut) / 2
      if (marge(ux * mid, uy * mid) >= cible) haut = mid
      else bas = mid
    }
    if (haut < meilleureNorme) {
      meilleureNorme = haut
      meilleurX = ux * haut
      meilleurY = uy * haut
    }
  }

  const x = meilleureNorme === Infinity ? secoursX : meilleurX
  const y = meilleureNorme === Infinity ? secoursY : meilleurY
  // rendu en unites de RAYON DE BOULE : le moteur le remet a son echelle
  return { x: +(x / R).toFixed(6), y: +(y / R).toFixed(6) }
}

/**
 * Le visage a couvrir : celui de l'expression si l'etat l'accepte, le sien sinon.
 *
 * UNE entree de table par expression, et non un pire cas commun a toutes. Un pire cas
 * paraissait plus sur — un decalage constant ne peut pas bouger quand l'expression change
 * — mais il est intenable : sur une capsule, `neutre` a les yeux hauts et demande a
 * descendre quand `effraye` les a bas et demande a monter. Aucune translation unique ne
 * satisfait les deux, et la mesure le confirme (4 debordements de 4,8 unites).
 *
 * Une entree par expression n'est pas moins fluide pour autant : le moteur interpole
 * entre DEUX CONSTANTES, ce qui est monotone par construction. Ce qui tremblait, c'etait
 * de re-resoudre le probleme sur un regard en cours d'interpolation.
 */
function visageDe(def: StateDef, pose: Pose, expr: BotExpression | null): Visage {
  if (def.baseFace && expr) return { gaze: expr.gaze, split: expr.split, eyes: expr.eyes }
  return { gaze: pose.gaze, split: pose.split, eyes: pose.eyes }
}

/** Les dates a echantillonner dans un etat : une seule si sa pose ne bouge pas. */
function dates(def: StateDef): number[] {
  /** Tout ce dont le solveur se sert : si rien ne bouge, une date suffit. */
  const signature = (p: Pose) =>
    JSON.stringify([p.gaze, p.split, p.eyes, p.sil.rot, p.sil.cx, p.sil.cy, p.sil.sx, p.sil.sy])
  if (signature(def.pose(0)) === signature(def.pose(def.duration))) return [0]
  const n = 3
  return Array.from({ length: n }, (_, i) => (i / (n - 1)) * def.duration)
}

/** Le decalage d'une forme sur un etat et une expression, derive comprise. */
function decalagePour(
  def: StateDef,
  radii: number[],
  expr: BotExpression | null
): { x: number; y: number } {
  const epreuves: Epreuve[] = []
  for (const t of dates(def)) {
    const pose = def.pose(t)
    const contour = toPoints({ ...pose.sil, radii }, R)
    const calContour = toPoints(pose.sil, R)
    const v = visageDe(def, pose, expr)
    // Les quatre coins de la derive bornent la pose nominale, qui est leur centre : la
    // tester en plus ne changerait aucune marge et coute une epreuve sur cinq.
    const coins: Visage[] = []
    for (const dy of [-DERIVE_YAW, DERIVE_YAW]) {
      for (const dp of [-DERIVE_PITCH, DERIVE_PITCH]) {
        coins.push({
          ...v,
          gaze: { yaw: v.gaze.yaw + dy, pitch: v.gaze.pitch + dp, roll: v.gaze.roll }
        })
      }
    }
    for (const c of coins) {
      epreuves.push({
        empreintes: empreintes(c, pose.sil, radii),
        reference: empreintes(c, pose.sil, pose.sil.radii),
        contour,
        calContour
      })
    }
  }
  return resous(epreuves)
}

/** Zero, la valeur commune a tout ce qui n'a rien a corriger. */
const NUL = { x: 0, y: 0 } as const

/** Clef d'une entree : l'etat, et l'expression quand l'etat l'accepte. */
const clef = (state: StateId, expr: string | null) => `${state}|${expr ?? ''}`

/**
 * Table des decalages, batie a l'import : une entree par (forme, etat a corps de base,
 * expression). Seuls `idle` et `swirl` portent le visage de repos, donc seuls eux se
 * declinent par expression — les trois autres etats a corps de base ont un visage releve
 * sur la video et une seule entree.
 *
 * Clef par REFERENCE du tableau de rayons, ce qui est deja la convention du moteur : ses
 * gardes `radii === this.shape` et `expression === this.expr` reposent sur la meme
 * stabilite. Un profil inconnu, ou `null`, ne corrige rien — l'API accepte n'importe quel
 * tableau et le moteur n'a pas a dependre de la prudence de ses appelants.
 */
function batir(): Map<number[], Map<string, { x: number; y: number }>> {
  return new Map(
  SHAPES.map((forme) => {
    const par = new Map<string, { x: number; y: number }>()
    for (const def of STATES) {
      if (!def.baseBody) continue
      const expressions = def.baseFace ? [null, ...EXPRESSIONS] : [null]
      for (const expr of expressions) {
        par.set(clef(def.id, expr?.id ?? null), decalagePour(def, forme.radii, expr))
      }
    }
    return [forme.radii, par]
  })
  )
}

const DECALAGES = batir()

/**
 * Decalage a appliquer aux deux yeux pour cette forme sur cet etat, en unites de rayon
 * de boule — le moteur le remet a son echelle.
 *
 * Vaut zero des que la forme n'est pas au catalogue, ce qui couvre `null` et le cercle :
 * sur le cercle les deux profils sont le meme, donc la marge est deja celle exigee et la
 * descente sort au premier tour. La forme relevee sur la video ne bouge donc pas, sans
 * cas particulier.
 */
export function decalageDesYeux(
  radii: number[] | null,
  state: StateId,
  expr: string | null
): { x: number; y: number } {
  if (!radii) return NUL
  const par = DECALAGES.get(radii)
  if (!par) return NUL
  // un etat sans visage de repos n'a qu'une entree, quelle que soit l'expression
  return par.get(clef(state, expr)) ?? par.get(clef(state, null)) ?? NUL
}

/** Pour les tests : de quoi verifier la table sans refaire la geometrie. */
/** Pour les tests : de quoi chronometrer la construction de la table. */
export const POUR_TESTS = { batir }
