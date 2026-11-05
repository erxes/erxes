// The CSS an extension's UI needs and the host doesn't already ship:
// Tailwind v4 over ui/src with erxes-ui's theme, minus every rule and theme
// variable the host's CSS has. The UI build inlines it, and the SDK injects
// it when the extension's first component loads.
//
// The host's CSS is compiled here from core-ui's styles.css. In a real
// deployment the host would publish its built CSS and this would fetch it.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import tailwind from '@tailwindcss/postcss';
import postcss, { type Root } from 'postcss';
import { REPO_DIR } from './paths';

const HOST_CSS = path.join(REPO_DIR, 'frontend/core-ui/src/styles.css');
const ERXES_THEME = path.join(REPO_DIR, 'frontend/libs/erxes-ui/src/theme.css');

const compile = async (css: string, from: string) =>
  postcss([tailwind()])
    .process(css, { from })
    .then((result) => result.root);

// Utility selectors and custom properties a stylesheet defines.
const inventory = (root: Root) => {
  const selectors = new Set<string>();
  const variables = new Set<string>();

  root.walkRules((rule) => {
    selectors.add(rule.selector);
  });
  root.walkDecls(/^--/, (decl) => {
    variables.add(decl.prop);
  });
  root.walkAtRules('property', (rule) => {
    variables.add(rule.params);
  });

  return { selectors, variables };
};

export const buildExtensionCss = async (extDir: string) => {
  const uiSrc = path.resolve(extDir, 'ui/src');
  const host = inventory(
    await compile(await readFile(HOST_CSS, 'utf8'), HOST_CSS),
  );

  // Theme and utilities only: preflight and base styles are the host's.
  const input = [
    '@layer theme, base, components, utilities;',
    "@import 'tailwindcss/theme.css' layer(theme);",
    "@import 'tailwindcss/utilities.css' layer(utilities) source(none);",
    `@import '${ERXES_THEME}';`,
    `@source '${uiSrc}';`,
  ].join('\n');
  const ext = await compile(input, path.join(uiSrc, 'extension.css'));

  // Drop what the host has: its rules already apply, and repeating them in a
  // later sheet would reorder them against the host's own variants.
  ext.walkRules((rule) => {
    if (rule.parent?.type === 'root' || rule.parent?.type === 'atrule') {
      if (host.selectors.has(rule.selector) && !rule.selector.startsWith(':')) {
        rule.remove();
      }
    }
  });
  // Only where variables are defined (theme `:root`, property fallbacks on
  // `*`). A utility setting `--tw-ring-color` is the utility itself.
  ext.walkDecls(/^--/, (decl) => {
    const owner = decl.parent;
    const selector = owner && 'selector' in owner ? String(owner.selector) : '';
    const definesVariable =
      selector.includes(':root') || selector.startsWith('*');

    if (definesVariable && host.variables.has(decl.prop)) {
      decl.remove();
    }
  });
  ext.walkAtRules('property', (rule) => {
    if (host.variables.has(rule.params)) {
      rule.remove();
    }
  });
  ext.walkAtRules('layer', (rule) => {
    if (rule.nodes && rule.nodes.length > 0 && rule.params === 'base') {
      rule.remove();
    }
  });

  // Rules and at-rules left empty by the removals above.
  let removed = true;
  while (removed) {
    removed = false;
    ext.walk((node) => {
      if (
        (node.type === 'rule' || (node.type === 'atrule' && node.nodes)) &&
        node.nodes?.length === 0
      ) {
        node.remove();
        removed = true;
      }
    });
  }

  return ext.toString();
};
