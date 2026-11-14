// The design system's rules (@shadcn/lint): screens compose erxes-ui components and theme
// tokens, and each component owns how it looks. packages/ui/AGENTS.md explains them.
import type { OxlintConfig } from 'vite-plus/lint';

export const designSettings = {
  shadcn: {
    ui: ['erxes-ui', '@erxes/ui'],
    note: 'Design rules: packages/ui/AGENTS.md.',
  },
} satisfies OxlintConfig['settings'];

// What a screen may put on a component's className: layout, and opacity to reveal a control on
// hover. The globs are layout too: shadcn-lint 0.2.5 reads no grid, max-width, max-height or
// min-height tokens from @theme, so it can't place theme.css's grid-cols-aside or max-h-popup.
const screenClasses = [
  'layout',
  'opacity-0',
  'opacity-100',
  'grid-cols-*',
  'grid-rows-*',
  'max-w-*',
  'max-h-*',
  'min-h-*',
];

export const designOverrides = [
  {
    files: ['apps/core-ui/src/**', 'packages/ui/src/**'],
    rules: {
      'shadcn/no-restyle': ['error', { allow: screenClasses }],
      'shadcn/no-arbitrary-values': 'error',
      // A style object whose keys are only known at runtime (a width per table column, a
      // colour per chart series) is built as `cssVariables`, typed Record<`--${string}`, string>.
      'shadcn/no-inline-styles': ['error', { allowDynamicIdentifiers: ['cssVariables'] }],
      // BlockNote styles its editor through its own bn-* classes, and the editor's blocks mark
      // the HTML they export with erxes-* classes that parsing reads back.
      'shadcn/no-unknown-classes': ['error', { allow: ['bn-*', 'erxes-*'] }],
      'shadcn/require-static-classes': 'error',
      'shadcn/no-raw-colors': 'error',
    },
  },
  {
    // Components compose each other and call their own variant functions inside erxes-ui,
    // which the linter can't read at the call site (shadcn-lint's documented setup). The
    // modules are erxes-ui's composite components: the record table, the editor's blocks,
    // the app layout.
    files: ['packages/ui/src/components/**', 'packages/ui/src/modules/**'],
    rules: { 'shadcn/no-restyle': 'off', 'shadcn/require-static-classes': 'off' },
  },
  {
    // The HTML an editor block exports is read without erxes-ui's stylesheet (in email, or
    // pasted elsewhere), so it carries its layout inline.
    files: ['packages/ui/src/modules/blocks/components/*ExternalHtml.tsx'],
    rules: { 'shadcn/no-inline-styles': 'off' },
  },
] satisfies OxlintConfig['overrides'];
