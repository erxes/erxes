// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
import type { Look } from './engine'
import type { ExpressionId } from './expressions'

/**
 * Ou le bot regarde quand il suit le curseur. Pur, comme `src/ui/timeline.ts` :
 * la position du pointeur entre en coordonnees deja normalisees, donc la regle
 * se teste sans DOM — et elle a besoin de l'etre, parce que deux signes s'y
 * trompent facilement.
 */

/**
 * Angles en degres d'orientation de tete. CHOISIS, pas releves : la video de
 * reference ne montre aucun suivi de curseur. Assez amples pour se distinguer de
 * la derive au repos (±7deg de lacet, ±5,5 de tangage), assez retenus pour
 * qu'aucun oeil ne parte derriere le limbe de la sphere.
 */
export const YAW_MAX = 16
export const PITCH_MAX = 13

/**
 * Hauteur a laquelle le regard se tient, curseur au centre. CHOISIE : legerement
 * au-dessus de l'equateur, ce qui donne un bot attentif plutot qu'absent.
 *
 * C'est une valeur ABSOLUE, et c'est tout le point : en relatif, la hauteur des
 * yeux suivait celle de chaque expression, et comme « neutre » regarde a
 * +28,6deg quand les humeurs sont entre -9 et +9, les yeux tombaient d'un coup
 * au premier changement d'humeur.
 */
export const PITCH = 10

/**
 * Duree du tour. Un peu plus courte que le bloc d'entree (`swirl`) : les yeux
 * doivent etre poses a gauche avant que les anneaux ne s'effacent.
 */
export const TURN_TIME = 1.1

/**
 * Humeurs que le bot traverse pendant qu'il suit le curseur.
 *
 * Toutes ont un ROULIS NUL, et c'est le critere de selection. Le lacet et le
 * tangage sont neutralises par le suivi (ils sont absolus), mais pas le roulis —
 * il fait pencher la tete, donc il deplace les yeux verticalement, et une humeur
 * a -15deg suivie d'une a +8 les fait sauter. Ce qui reste pour distinguer les
 * humeurs, c'est la FORME des yeux : ronds, plisses, ecarquilles, aplatis. C'est
 * largement suffisant, et c'est ce qui se lit.
 *
 * Ce n'est donc pas une liste de gouts : y ajouter « curieux » (roulis -15deg)
 * ramenerait le saut.
 */
export const HUMEURS: readonly ExpressionId[] = [
  'surpris',
  'heureux',
  'hilare',
  'excite',
  'fier',
  'blase'
]

export interface Aim {
  /** ecart horizontal du pointeur au centre du bot, -1 a 1 (droite positive) */
  nx: number
  /** ecart vertical, -1 a 1, dans le sens de l'ecran (bas positif) */
  ny: number
  /** avancement de l'arrivee, 0 a 1 */
  tour: number
  /** false = aucun pointeur connu : la tete reste tournee, mais elle revit */
  pointer: boolean
}

/**
 * Cible de regard, variante centree : la bulle n'est pas dans une vue a panneau
 * lateral, donc il n'y a pas de `TURN` ni de `SPIN` — le regard se pose a
 * l'equateur et le `mix` monte pendant `TURN_TIME`, comme dans l'original.
 *
 * Rien ici ne compense l'expression affichee : c'est le moteur qui melange,
 * parce que lui seul connait la pose a l'instant t. Le faire ici obligerait a
 * lire le lacet d'ARRIVEE de l'expression pendant que le moteur, lui, morphe
 * encore — et les yeux sauteraient a chaque changement d'humeur.
 */
export function lookTarget({ nx, ny, tour, pointer }: Aim): Look {
  return {
    yaw: nx * YAW_MAX,
    // tangage positif = regard vers le haut, alors que le y de l'ecran descend
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: 0,
    // Sans pointeur la tete garde sa direction, mais on lui rend sa derive :
    // sinon le bot fixe un point mort.
    wander: pointer ? 0 : 1
  }
}
