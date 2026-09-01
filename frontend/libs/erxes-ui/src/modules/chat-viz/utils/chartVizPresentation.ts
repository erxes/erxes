const CHART_VIZ_PALETTE_SIZE = 5;

const AXIS_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Core theme chart values are complete CSS colors (currently oklch). */
export const getDefaultChartVizColor = (index: number): string =>
  `var(--chart-${(index % CHART_VIZ_PALETTE_SIZE) + 1})`;

export const formatChartVizAxisValue = (value: number): string =>
  AXIS_NUMBER_FORMATTER.format(value);

/**
 * Adds breathing room around line/area data, especially a constant series.
 * Recharts' default zero-based domain pins a flat, large-value line against
 * the top edge and makes it look missing.
 */
export const getChartVizTrendDomain = ([dataMin, dataMax]: [number, number]): [
  number,
  number,
] => {
  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) return [0, 1];

  const span = dataMax - dataMin;
  const padding =
    span === 0
      ? Math.max(Math.abs(dataMax) * 0.08, 1)
      : Math.max(Math.abs(span) * 0.08, Number.EPSILON);

  return [dataMin - padding, dataMax + padding];
};
