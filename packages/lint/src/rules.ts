// The rule sets of the preset (index.ts). `rules` holds everywhere, `browserRules` and
// `designRules` in browser code, `serverRules` in server code.
import type { OxlintConfig } from 'vite-plus/lint';

export const rules = {
  'vite-plus/prefer-vite-plus-imports': 'error',
  // `const { secret, ...rest } = row` drops a field on purpose; Express
  // error handlers need all four parameters (`_next`).
  'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
  // Servers log through pino; CLIs write to process.stdout.
  'no-console': 'error',
  'no-debugger': 'error',
  'import/no-default-export': 'error',
  'import/no-duplicates': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': 'error',
  'oxc/no-barrel-file': 'error',
  'oxc/no-accumulating-spread': 'error',
  'typescript/no-explicit-any': 'error',
  'typescript/no-unsafe-assignment': 'error',
  'typescript/no-unsafe-argument': 'error',
  'typescript/no-unsafe-call': 'error',
  'typescript/no-unsafe-member-access': 'error',
  'typescript/no-unsafe-return': 'error',
  'typescript/no-unsafe-type-assertion': 'error',
  'typescript/no-floating-promises': 'error',
  'typescript/no-misused-promises': 'error',
  'typescript/no-non-null-assertion': 'error',
  'typescript/ban-ts-comment': [
    'error',
    { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false },
  ],
  'typescript/no-deprecated': 'error',
  'typescript/only-throw-error': 'error',
  'typescript/prefer-promise-reject-errors': 'error',
  'typescript/return-await': ['error', 'in-try-catch'],
  // `name || email`: an empty string falls back on purpose; for other types `??` is meant.
  'typescript/prefer-nullish-coalescing': ['error', { ignorePrimitives: { string: true } }],
  'typescript/consistent-type-imports': 'error',
  'unicorn/prefer-node-protocol': 'error',
  'unicorn/throw-new-error': 'error',
  eqeqeq: ['error', 'smart'],
  'no-param-reassign': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
  // No task-marker comments left in code: finish it or don't write it.
  'no-warning-comments': 'error',
  // Express 5 passes a rejected handler promise to the error handler, so async
  // route handlers are safe; the rule guards Express 4.
  'oxc/no-async-endpoint-handlers': 'off',
  // Settings are read once, validated, in the API's config.ts.
  'node/no-process-env': 'error',
  // noImplicitReturns in tsconfig.base.json checks this with types, so exhaustive switches pass.
  'typescript/consistent-return': 'off',
  'typescript/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],
  // Size limits. Big files are where agents pile up unrelated code, and every agent reads a
  // file whole. Split by responsibility (a feature's router, service, queries), not into
  // part1/part2. Raising a limit is a rule change, in its own PR.
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': [
    'error',
    { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
  ],
  'anti-slop/no-reduce-accumulator-copy': 'error',
  'anti-slop/no-object-parameters': 'error',
  'anti-slop/no-reflect-apply': 'error',
  'anti-slop/no-reflect-get': 'error',
  'anti-slop/no-shape-in-symbol-names': 'error',
  'anti-slop/no-unknown-type-aliases': 'error',
  'anti-slop/no-widen-then-assert': 'error',
  'anti-slop/require-readable-spacing': 'error',
  // A malformed token claim must fail verification, never fall back to a value.
  'anti-slop/no-zod-catch': 'error',
  'erxes/no-session-advisory-lock': 'error',
} satisfies OxlintConfig['rules'];

/** What server code adds. */
export const serverRules = {
  // A query per item is an N+1: batch it (`inArray`, a set-based update), or run the steps in
  // order on purpose through a named helper.
  'no-await-in-loop': 'error',
  // Row level security scopes every query to the organisation, so code adds no org_id filter.
  'erxes/no-org-filter': 'error',
} satisfies OxlintConfig['rules'];

/** What browser code adds, in an override that enables the `react` and `jsx-a11y` plugins. */
export const browserRules = {
  'react/rules-of-hooks': 'error',
  'react/exhaustive-deps': 'error',
  'react/no-unstable-nested-components': 'error',
  'react/purity': 'error',
  'react/refs': 'error',
  'react/immutability': 'error',
  'react/set-state-in-effect': 'error',
  'react/no-array-index-key': 'error',
  'react/no-danger': 'error',
  'react/iframe-missing-sandbox': 'error',
  // The automatic JSX runtime (jsx: react-jsx) needs no React in scope.
  'react/react-in-jsx-scope': 'off',
  'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
} satisfies OxlintConfig['rules'];

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

/**
 * The design system's rules (@shadcn/lint) for screens: they compose erxes-ui components and
 * theme tokens, and each component owns how it looks.
 */
export const designRules = {
  'shadcn/no-restyle': ['error', { allow: screenClasses }],
  'shadcn/no-arbitrary-values': 'error',
  // A style object whose keys are only known at runtime (a width per table column, a
  // colour per chart series) is built as `cssVariables`, typed Record<`--${string}`, string>.
  'shadcn/no-inline-styles': ['error', { allowDynamicIdentifiers: ['cssVariables'] }],
  'shadcn/no-unknown-classes': 'error',
  'shadcn/require-static-classes': 'error',
  'shadcn/no-raw-colors': 'error',
} satisfies OxlintConfig['rules'];
