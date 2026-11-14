// The rules only core gets, on top of rules.ts: its own lint plugins (tools/lint) and
// choices tied to core's code.
import type { OxlintConfig } from 'vite-plus/lint';

export const coreRules = {
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
  // An automation branch step's `then` arm is a stored list of steps (the definition
  // format in the contract and the database), never a function.
  'unicorn/no-thenable': 'off',
} satisfies OxlintConfig['rules'];
