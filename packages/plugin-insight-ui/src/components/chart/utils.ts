export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  POLAR_AREA: 'polarArea',
  RADAR: 'radar',
  BUBBLE: 'bubble',
  SCATTER: 'scatter',
};

export const DEFAULT_CHART_COLORS = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
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
  radar: [10, 20, 30, 40, 50, 40],
};

const lastSixMonths = [
  new Date().toLocaleString('default', { month: 'long' }),
  new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' },
  ),
  new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' },
  ),
  new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' },
  ),
  new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' },
  ),
  new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toLocaleString(
    'default',
    { month: 'long' },
  ),
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
  radar: lastSixMonths,
};

export const DATALABELS_CONFIGS = {
  bar: {
    anchor: 'end',
    align: 'top',
    offset: 2
  },
  line: {
    anchor: 'end',
    align: 'top',
    offset: 2
  }
}

export const horizontalDottedLine = {
  id: 'horizontalDottedLine',
  beforeDatasetsDraw(chart, args, options) {
    const { ctx, chartArea: { top, right, bottom, left, width, height }, scales: { x, y } } = chart;

    ctx.save();

    const targetValue = options.targetValue || 0;
    const showLine = options.showLine !== undefined ? options.showLine : true;
    const label = options.label || '';

    if (targetValue > y.max) {
      y.options.max = targetValue + 50;
      chart.update();
    }

    if (targetValue > 0 && showLine) {
      ctx.strokeStyle = 'grey';
      ctx.setLineDash([10, 5]);

      // Draw the dotted line
      ctx.beginPath();
      ctx.moveTo(left, y.getPixelForValue(targetValue));
      ctx.lineTo(right, y.getPixelForValue(targetValue));
      ctx.stroke();

      // Draw the label
      if (label) {
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, right - 10, y.getPixelForValue(targetValue));
      }
    }

    ctx.restore();
  }
};