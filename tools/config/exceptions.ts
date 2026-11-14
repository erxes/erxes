// The files a rule is off for, each with the reason. A new entry is a rule change: it goes
// in its own PR, never in the PR whose code the rule rejected.
import type { OxlintConfig } from 'vite-plus/lint';

// An entry that turns off a React or accessibility rule names the plugins again: oxlint
// applies an override's rules only for the plugins that override enables.
const browserPlugins: NonNullable<OxlintConfig['plugins']> = ['react', 'jsx-a11y'];

export const exceptions = [
  {
    // ARIA widgets with no native element: a combobox popup and its options that keep the
    // caret in the textarea, a focusable window splitter with a grip inside (<hr> holds no
    // children), and an email chip inside triggers that are buttons already.
    files: [
      'apps/web/src/modules/activity/NoteComposer.tsx',
      'apps/web/src/modules/side-panel/RecordSidePanelResizeHandle.tsx',
      'packages/ui/src/modules/display/components/EmailDisplay.tsx',
    ],
    plugins: browserPlugins,
    rules: { 'jsx-a11y/prefer-tag-over-role': 'off' },
  },
  {
    // Position is identity: a file's columns are positional, and a test trace can repeat a step.
    files: [
      'apps/web/src/modules/settings/import-export/ImportSetup.tsx',
      'apps/web/src/modules/automations/TestPanel.tsx',
    ],
    plugins: browserPlugins,
    rules: { 'react/no-array-index-key': 'off' },
  },
  {
    // src is always a YouTube, Vimeo or Cloudflare Stream player (cross-origin), and those
    // players need their own origin's storage to play.
    files: ['packages/ui/src/modules/blocks/components/CustomVideoBlock.tsx'],
    plugins: browserPlugins,
    rules: { 'react/iframe-missing-sandbox': 'off' },
  },
  {
    // useCreateBlockNote builds the editor; plugins call its blocksToHTMLLossy, so the clean
    // export can only wrap that method.
    files: ['packages/ui/src/modules/blocks/hooks/useBlockEditor.tsx'],
    plugins: browserPlugins,
    rules: { 'react/immutability': 'off' },
  },
  {
    // The host registers this component once, at module level; it is read from a store, not
    // created during render.
    files: ['packages/ui/src/utils/record-timeline.tsx'],
    plugins: browserPlugins,
    rules: { 'react/static-components': 'off' },
  },
  {
    // tanstack's Table is invariant in its row type; the shared context holds any table, and
    // readers treat rows as RowData.
    files: ['packages/ui/src/modules/record-table/components/RecordTableProvider.tsx'],
    rules: { 'typescript/no-unsafe-type-assertion': 'off' },
  },
  {
    // The one file that writes the value lists out.
    files: ['packages/db/src/enums.ts'],
    rules: { 'erxes/no-inline-enum': 'off' },
  },
  {
    // Tools load these through their default export.
    files: [
      'vite.config.ts',
      'knip.ts',
      '**/{tsdown,playwright}.config.ts',
      'e2e/globalSetup.ts',
      'apps/web/rsbuild.config.ts',
      'packages/db/drizzle.config.ts',
      'tools/lint/*/index.ts',
      'tools/lint/anti-slop/vendor/**',
    ],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    // Each package's one public entry (package.json `exports`), and the
    // schema module drizzle-kit and the client load whole. Phase 2 splits
    // the contract into subpath exports.
    files: [
      'packages/contract/src/index.ts',
      'packages/db/src/index.ts',
      'packages/db/src/schema/index.ts',
      'packages/plugin-sdk/src/index.ts',
    ],
    rules: { 'oxc/no-barrel-file': 'off' },
  },
  {
    // Copied from the HR plugin (and ESLint Stylistic in vendor/). Kept as
    // upstream wrote it so the copies stay easy to compare.
    files: ['tools/lint/anti-slop/**'],
    rules: {
      'typescript/no-unsafe-type-assertion': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
    },
  },
  {
    // ESLint Stylistic's rule, vendored unchanged (see its UPSTREAM.md): splitting or
    // rewriting it would make upstream fixes hard to carry over.
    files: ['tools/lint/anti-slop/vendor/**'],
    rules: {
      'typescript/no-non-null-assertion': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
] satisfies OxlintConfig['overrides'];
