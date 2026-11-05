// @tailwindcss/postcss's own types name a newer postcss than the root one
// css.ts runs it with, and the two Plugin types don't match.
declare module '@tailwindcss/postcss' {
  import type { PluginCreator } from 'postcss';

  const tailwind: PluginCreator<object>;
  export default tailwind;
}
