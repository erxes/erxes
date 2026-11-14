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
// hover. A contract widens that for components whose look the screen owns by nature.
const screenClasses = ['layout', 'opacity-0', 'opacity-100'];

const contracts: { pattern: string; allow: string[]; message?: string }[] = [
  // buttons
  // forms
  // overlays
  // layout
];

export const designOverrides = [
  {
    files: ['apps/core-ui/src/**', 'packages/ui/src/**'],
    rules: {
      'shadcn/no-restyle': ['error', { allow: screenClasses, contracts }],
      'shadcn/no-arbitrary-values': 'error',
      'shadcn/no-inline-styles': 'error',
      // BlockNote styles its editor through its own bn-* classes.
      'shadcn/no-unknown-classes': ['error', { allow: ['bn-*'] }],
      'shadcn/require-static-classes': 'error',
      'shadcn/no-raw-colors': 'error',
    },
  },
  {
    // Components compose each other inside erxes-ui.
    files: ['packages/ui/src/components/**'],
    rules: { 'shadcn/no-restyle': 'off' },
  },
] satisfies OxlintConfig['overrides'];
