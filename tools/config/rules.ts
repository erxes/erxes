// The lint setup every erxes repo on the new stack shares: create-erxes copies this
// file and budgets.ts into each plugin unchanged. What only core gets is in
// core-rules.ts, import bans in restricted.ts, what each part of the repo adds in areas.ts.
import type { OxlintConfig } from 'vite-plus/lint';

export const lintBase = {
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest', 'promise', 'node'],
  jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  categories: { correctness: 'error', suspicious: 'error' },
  options: { typeAware: true, typeCheck: true },
} satisfies OxlintConfig;

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
