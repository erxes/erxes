export const SCORE_ACTION_OPTIONS = [
  {
    value: 'add',
    label: 'Add score',
  },
  {
    value: 'subtract',
    label: 'Subtract score',
  },
] as const;

export const SCORE_ACTION_LABELS = {
  add: 'Add score',
  subtract: 'Subtract score',
} as const;
