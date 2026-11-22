import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import reactCompiler from 'babel-plugin-react-compiler';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
// Plugin UIs declare the same list with `import: false`, so the host provides every one.
import { SHARED } from 'erxes-ui/federation';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginBundleBudget } from './bundleBudget';

const ui = resolve(import.meta.dirname, '../../packages/ui/src');

/**
 * BlockNote's sheet styles ProseMirror's own classes (`.ProseMirror table`, the selected
 * node's outline), so it also reached the broadcast email editor (maily, also ProseMirror)
 * and, loading with the block editor's chunk, would beat maily's rules of the same
 * specificity whenever it loaded after them. Those rules keep their specificity but match
 * only inside BlockNote's editor, `.bn-editor` being its ProseMirror root. Tailwind has
 * inlined BlockNote's sheet into erxes-ui's editor.css by the time this runs.
 */
const scopeBlockNoteProseMirror = {
  postcssPlugin: 'erxes-scope-blocknote-prosemirror',
  Once(root: {
    source?: { input: { file?: string } };
    walkRules: (visit: (rule: { selectors: string[] }) => void) => void;
  }) {
    if (!/[\\/]modules[\\/]blocks[\\/]editor\.css$/.test(root.source?.input.file ?? '')) return;

    root.walkRules((rule) => {
      rule.selectors = rule.selectors.map((selector) => {
        if (selector.includes('bn-') || !selector.includes('.ProseMirror')) return selector;

        return /^\.ProseMirror(?![\w-])/.test(selector)
          ? selector.replace('.ProseMirror', '.ProseMirror:where(.bn-editor)')
          : `:where(.bn-editor) ${selector}`;
      });
    });
  },
};

// Scalar's prebuilt browser build, served as is under /static/scalar (Settings › API reference):
// bundled, its Vue graph would share chunks with ours and move kilobytes into every route.
const scalar = resolve(
  dirname(fileURLToPath(import.meta.resolve('@scalar/api-reference'))),
  'browser',
);

// The dev server's port and API address come from the shell.
const { WEB_PORT, CORE_API_URL } = process.env;

/**
 * The erxes core UI (apps/web). Same-origin with the API: in development
 * the dev server forwards /core to apps/api; in production a reverse proxy
 * serves both under one address, so the session cookie stays first-party.
 * It is also the Module Federation host for plugin UIs (PUBLIC_PLUGINS).
 */
export default defineConfig({
  plugins: [
    pluginReact(),
    // The React Compiler memoizes components and hooks, so a state change re-renders only
    // what reads it. Babel runs it on our own source before SWC; node_modules stay as shipped.
    pluginBabel({
      include: [resolve(import.meta.dirname, 'src'), ui],
      babelLoaderOptions: (options) => {
        options.plugins ??= [];
        options.plugins.unshift(reactCompiler);
      },
    }),
    pluginModuleFederation({
      name: 'core',
      // The host exposes nothing and loads remotes at runtime, so there are no
      // federated types to build (the dts plugin also needs TypeScript 5's API).
      dts: false,
      shared: Object.fromEntries(
        SHARED.map((name) => [name, { singleton: true, requiredVersion: false }]),
      ),
    }),
    pluginBundleBudget(),
  ],
  source: {
    entry: { index: './src/main.tsx' },
  },
  resolve: {
    alias: {
      '~': './src',
      // erxes-ui is compiled from its source in packages/ui
      'erxes-ui$': `${ui}/index.ts`,
      'erxes-ui': ui,
    },
  },
  output: {
    copy: [
      {
        from: '{standalone.esm.js,chunks/*.js}',
        context: scalar,
        to: 'static/scalar/',
      },
    ],
  },
  html: {
    title: 'erxes',
    // The erxes "X" mark (OrgLogoIcon) on the brand colour, `--primary`.
    favicon: './src/favicon.svg',
    meta: {
      // BlockNote keeps its toolbar above a phone's virtual keyboard only when the
      // keyboard resizes the page.
      viewport: 'width=device-width, initial-scale=1, interactive-widget=resizes-content',
    },
  },
  dev: {
    // Lazily compiled chunks break Module Federation shared singletons
    // ("factory is undefined" for react), so compile everything up front.
    lazyCompilation: false,
  },
  server: {
    port: Number(WEB_PORT) || 3500,
    proxy: {
      '/core': CORE_API_URL || 'http://localhost:3400',
    },
  },
  tools: {
    postcss: (_options, { addPlugins }) => addPlugins([tailwindcss(), scopeBlockNoteProseMirror]),
    rspack: { resolve: { fallback: { fs: false, path: false } } },
  },
});
