// @tailwindcss/postcss ships its types only under `exports`, which this
// package's node10 resolution can't read.
declare module '@tailwindcss/postcss' {
  import type { PluginCreator } from 'postcss';

  const tailwind: PluginCreator<object>;
  export default tailwind;
}
