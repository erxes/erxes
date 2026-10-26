// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
/**
 * Le repere de tout ce que le moteur rend.
 *
 * `engine.sample()` sort des coordonnees en unites de viewBox, et ces deux nombres en sont
 * la definition : sans eux, une sortie du moteur ne veut rien dire. Ils vivaient dans
 * `BloubBot.vue`, donc hors d'atteinte — un `<script setup>` n'exporte rien — et
 * `export.ts` en redisait un a la main avec le commentaire qui nommait le probleme.
 *
 * Ils sont ici parce que `src/bot/` est ce qui se lit et se consomme du dehors : le
 * composant Vue est UN client du moteur, pas sa definition.
 */

/**
 * Rayon de la boule au repos, en unites de viewBox. C'est le `scale` que le composant
 * passe a `BotEngine`.
 *
 * Choisi et non mesure : c'est l'unite de travail. Tout le reste du dossier s'exprime en
 * fractions de ce rayon, ce qui rend les mesures relevees sur la video independantes de la
 * taille d'affichage.
 */
export const RAYON = 100

/**
 * Demi-cote du viewBox affiche. La marge au-dela du rayon loge les anneaux.
 *
 * Ce n'est pas une valeur libre : les anneaux de l'orbite et le swoosh de la comete montent
 * a 1,4 fois le rayon, soit 140. Rien ne les borne au runtime — c'est le reglage a la main
 * des tableaux `RINGS` et `SWOOSH` (`decor.ts`) qui les tient sous 158, et un test le
 * verrouille.
 */
export const DEMI_VIEWBOX = 158
