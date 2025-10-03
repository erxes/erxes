const fitViewOptions = { padding: 4, minZoom: 0.8 };
export const PROPERTY_OPERATOR = {
  String: [
    {
      value: 'set',
      label: 'Set',
    },
    {
      value: 'concat',
      label: 'Concat',
    },
  ],
  Date: [
    {
      value: 'set',
      label: 'Set',
    },
    {
      value: 'addDay',
      label: 'Add Day',
    },
    {
      value: 'subtractDay',
      label: 'Subtract Day',
    },
  ],
  Number: [
    {
      value: 'add',
      label: 'Add',
    },
    {
      value: 'subtract',
      label: 'subtract',
    },
    {
      value: 'multiply',
      label: 'Multiply',
    },
    {
      value: 'divide',
      label: 'Divide',
    },
    {
      value: 'set',
      label: 'Set',
    },
  ],
  Default: [
    {
      value: 'set',
      label: 'Set',
    },
  ],
};

export const STATUSES_BADGE_VARIABLES = {
  active: 'default',
  waiting: 'secondary',
  error: 'destructive',
  missed: 'warning',
  complete: 'success',
} as const;

export const AUTOMATION_HISTORIES_CURSOR_SESSION_KEY =
  'automation-histories-cursor';
