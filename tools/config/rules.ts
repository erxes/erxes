// The lint rules every file gets. Size limits are in budgets.ts, import bans in
// restricted-imports.ts, what each part of the repo adds in areas.ts.
import type { OxlintConfig } from 'vite-plus/lint';

export const rules = {
  'vite-plus/prefer-vite-plus-imports': 'error',
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
  // `const { secret, ...rest } = row` drops a field on purpose; Express
  // error handlers need all four parameters (`_next`).
  'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
  // Servers log through pino (apps/core-api/src/logger.ts); CLIs write to process.stdout.
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
  // An automation branch step's `then` arm is a stored list of steps (the definition
  // format in the contract and the database), never a function.
  'unicorn/no-thenable': 'off',
  eqeqeq: ['error', 'smart'],
  'no-param-reassign': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
  // No TODO/FIXME/XXX left in code: finish it or don't write it.
  'no-warning-comments': 'error',
  // Express 5 passes a rejected handler promise to the error handler, so async
  // route handlers are safe; the rule guards Express 4.
  'oxc/no-async-endpoint-handlers': 'off',
  // Settings are read once, validated, in apps/core-api/src/config.ts.
  'node/no-process-env': 'error',
  // noImplicitReturns in tsconfig.base.json checks this with types, so exhaustive switches pass.
  'typescript/consistent-return': 'off',
  'typescript/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: true }],
} satisfies OxlintConfig['rules'];
