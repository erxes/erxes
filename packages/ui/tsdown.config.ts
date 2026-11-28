import { defineConfig } from 'tsdown';

const CSS = ['styles.css', 'fonts.css', 'theme.css', 'base.css', 'components.css'];

// The publishable build: one ES module per source file, so `erxes-ui/<path>` keeps
// working. The workspace imports the sources (web aliases erxes-ui to src/):
// `exports` point at src/ and the dist ones go in `publishConfig`. The style sheets
// ship as source, since the app's Tailwind build compiles them.
export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.*', '!src/**/__tests__/**'],
  platform: 'browser',
  unbundle: true,
  dts: true,
  copy: [
    ...CSS.map((file) => ({ from: `src/${file}`, to: 'dist' })),
    // The block editor imports its sheet: it ships beside it for the app's bundler.
    { from: 'src/modules/blocks/editor.css', to: 'dist/modules/blocks' },
  ],
  deps: { neverBundle: [/\.css$/] },
  exports: {
    devExports: true,
    // Only the root is listed; every other module is reached through `./*`.
    exclude: [/^(?!index$)/],
    customExports: (exports, { isPublish }) => ({
      ...exports,
      ...Object.fromEntries(
        CSS.map((file) => [`./${file}`, isPublish ? `./dist/${file}` : `./src/${file}`]),
      ),
      './*': isPublish ? { types: './dist/*.d.ts', default: './dist/*.js' } : './src/*',
    }),
  },
  publint: true,
  // The style sheets have no types to check.
  attw: { profile: 'esm-only', level: 'error', excludeEntrypoints: [/\.css$/] },
});
