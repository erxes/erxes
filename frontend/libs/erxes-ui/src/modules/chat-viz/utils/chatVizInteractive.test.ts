import type { ChartVizPayload } from '../types/chatVizTypes';
import {
  applyChartVizTransforms,
  getChartVizInteractiveDomain,
  getDefaultChartVizControlValues,
} from './chartVizTransforms';
import { sanitizeChartVizPayload } from './chatVizSanitize';
import {
  formatChartVizAxisValue,
  getChartVizTrendDomain,
  getDefaultChartVizColor,
} from './chartVizPresentation';

const interactivePayload: ChartVizPayload = {
  type: 'chart-viz',
  chartType: 'line',
  title: 'Revenue forecast',
  data: [
    { label: 'May', revenue: 100 },
    { label: 'June', revenue: 100 },
  ],
  series: [{ key: 'revenue', label: 'Revenue' }],
  controls: [
    {
      type: 'slider',
      key: 'growth',
      label: 'Growth adjustment',
      min: -20,
      max: 20,
      step: 1,
      defaultValue: 10,
      valueSuffix: '%',
    },
  ],
  transforms: [
    {
      controlKey: 'growth',
      seriesKey: 'revenue',
      operation: 'compoundPercent',
    },
  ],
  sentAt: '2026-08-31T00:00:00.000Z',
};

describe('interactive chart-viz payloads', () => {
  it('sanitizes controls and admits only allow-listed, referential transforms', () => {
    const sanitized = sanitizeChartVizPayload({
      ...interactivePayload,
      controls: [
        {
          ...interactivePayload.controls?.[0],
          min: 20,
          max: -20,
          step: 100,
          defaultValue: 99,
          valuePrefix: '1234567890123456789012345',
        },
        {
          type: 'slider',
          key: 'unused',
          label: 'Unused control',
          min: 0,
          max: 10,
          step: 1,
          defaultValue: 5,
        },
      ],
      transforms: [
        ...(interactivePayload.transforms ?? []),
        {
          controlKey: 'growth',
          seriesKey: 'revenue',
          operation: 'javascript',
        },
        {
          controlKey: 'missing',
          seriesKey: 'revenue',
          operation: 'percent',
        },
      ],
    });

    expect(sanitized?.controls).toEqual([
      expect.objectContaining({
        key: 'growth',
        min: -20,
        max: 20,
        step: 40,
        defaultValue: 20,
        valuePrefix: '12345678901234567890',
      }),
    ]);
    expect(sanitized?.transforms).toEqual(interactivePayload.transforms);
  });

  it('uses valid theme colors and pads a constant trend into view', () => {
    expect(getDefaultChartVizColor(0)).toBe('var(--chart-1)');
    expect(getDefaultChartVizColor(5)).toBe('var(--chart-1)');
    expect(getChartVizTrendDomain([100, 100])).toEqual([92, 108]);
    expect(formatChartVizAxisValue(132_300)).toBe('132.3K');
  });

  it('recalculates data through the bounded transform interpreter', () => {
    const defaults = getDefaultChartVizControlValues(interactivePayload);
    const adjusted = applyChartVizTransforms(interactivePayload, defaults);

    expect(defaults).toEqual({ growth: 10 });
    expect(adjusted.data[0]?.revenue).toBeCloseTo(110);
    expect(adjusted.data[1]?.revenue).toBeCloseTo(121);
    expect(interactivePayload.data).toEqual([
      { label: 'May', revenue: 100 },
      { label: 'June', revenue: 100 },
    ]);
  });

  it('freezes one axis domain across every control extreme', () => {
    // Extremes: growth -20% compounds down to 64, +20% up to 144.
    const domain = getChartVizInteractiveDomain(interactivePayload);

    expect(domain?.[0]).toBeCloseTo(57.6, 5);
    expect(domain?.[1]).toBeCloseTo(150.4, 5);

    // Every scenario the slider can reach must fit inside the frozen domain,
    // so moving the slider moves the geometry instead of relabeling ticks.
    for (const growth of [-20, 0, 10, 20]) {
      const scenario = applyChartVizTransforms(interactivePayload, { growth });
      const values = scenario.data.map((d) => d.revenue as number);
      expect(Math.min(...values)).toBeGreaterThanOrEqual(domain?.[0] ?? 0);
      expect(Math.max(...values)).toBeLessThanOrEqual(domain?.[1] ?? 0);
    }
  });

  it('keeps interactive bar charts zero-based', () => {
    const domain = getChartVizInteractiveDomain(interactivePayload, {
      includeZero: true,
    });

    expect(domain?.[0]).toBe(0);
    expect(domain?.[1]).toBeCloseTo(155.52, 2);
  });

  it('leaves non-interactive payloads on the per-chart default domain', () => {
    const staticPayload = { ...interactivePayload };
    delete staticPayload.controls;
    delete staticPayload.transforms;

    expect(getChartVizInteractiveDomain(staticPayload)).toBeUndefined();
    expect(
      getChartVizInteractiveDomain(staticPayload, { includeZero: true }),
    ).toBeUndefined();
  });
});
