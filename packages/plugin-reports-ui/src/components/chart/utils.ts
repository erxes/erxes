export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  POLAR_AREA: 'polarArea',
  RADAR: 'radar',
  BUBBLE: 'bubble',
  SCATTER: 'scatter'
};

export const DEFAULT_BACKGROUND_COLORS = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)'
];

export const DEFAULT_BORDER_COLORS = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)'
];

export const DEFAULT_DATA_PER_CHART: {
  [template: string]: number[] | any[];
} = {
  bar: [10, 20, 30, 40, 50, 40],
  line: [10, 20, 30, 40, 50, 40],
  scatter: [10, 20, 30, 40, 50, 40],
  bubble: [10, 20, 30, 40, 50, 40],
  pie: [10, 20, 30, 40, 50, 40],
  doughnut: [10, 20, 30, 40, 50, 40],
  polarArea: [10, 20, 30, 40, 50, 40],
  radar: [10, 20, 30, 40, 50, 40]
};

const lastSixMonths = [
  new Date().toLocaleString('default', { month: 'long' }),
  new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' }
  ),
  new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' }
  ),
  new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' }
  ),
  new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' }
  ),
  new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' }
  )
].reverse();

export const DEFAULT_LABELS_PER_CHART: {
  [template: string]: number[] | any[];
} = {
  bar: lastSixMonths,
  line: lastSixMonths,
  scatter: lastSixMonths,
  bubble: lastSixMonths,
  pie: lastSixMonths,
  doughnut: lastSixMonths,
  polarArea: lastSixMonths,
  radar: lastSixMonths
};
