export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const QUARTERS = ['quarter-1', 'quarter-2', 'quarter-3', 'quarter-4'];

export const FIXED_DATES = [
  'today',
  'in-the-past',
  'last-1-day',
  'last-3-days',
  'last-7-days',
  'last-3-months',
];

export const RENAMED_FIXED_DATES = new Map([
  ['1-day-from-now', 'last-1-day'],
  ['3-days-from-now', 'last-3-days'],
  ['1-week-from-now', 'last-7-days'],
  ['3-months-from-now', 'last-3-months'],
]);
