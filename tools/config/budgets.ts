// Size limits. Big files are where agents pile up unrelated code, and every agent reads a
// file whole. Split by responsibility (a feature's router, service, queries), not into
// part1/part2. Raising a limit is a rule change, in its own PR.
import type { OxlintConfig } from 'vite-plus/lint';

export const budgetRules = {
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': [
    'error',
    { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
  ],
} satisfies OxlintConfig['rules'];

export const budgetOverrides = [
  {
    // A test file's describe callback holds all its cases; max-lines still bounds the file.
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: { 'max-lines-per-function': 'off' },
  },
] satisfies OxlintConfig['overrides'];
