// The rules only core gets, on top of @erxes/lint's preset: choices tied to core's code.
// Core's own lint plugin (tools/lint/core.ts) is turned on per part of the repo in areas.ts.
import type { OxlintConfig } from 'vite-plus/lint';

export const coreRules = {
  // An automation branch step's `then` arm is a stored list of steps (the definition
  // format in the contract and the database), never a function.
  'unicorn/no-thenable': 'off',
} satisfies OxlintConfig['rules'];
