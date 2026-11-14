// The design system's rules (@erxes/lint's designRules, from @shadcn/lint) on core's screens:
// they compose erxes-ui components and theme tokens, and each component owns how it looks.
// packages/ui/AGENTS.md explains them.
import { designRules } from '@erxes/lint';
import type { OxlintConfig } from 'vite-plus/lint';

export const designOverrides = [
  {
    files: ['apps/web/src/**', 'packages/ui/src/**'],
    rules: {
      ...designRules,
      // BlockNote styles its editor through its own bn-* classes, and the editor's blocks mark
      // the HTML they export with erxes-* classes that parsing reads back.
      'shadcn/no-unknown-classes': ['error', { allow: ['bn-*', 'erxes-*'] }],
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
