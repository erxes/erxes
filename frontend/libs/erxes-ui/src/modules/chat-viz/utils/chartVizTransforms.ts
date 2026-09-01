import type {
  ChartVizPayload,
  ChartVizTransformOperation,
} from '../types/chatVizTypes';
import { getChartVizTrendDomain } from './chartVizPresentation';

const MAX_ABS_RENDERED_VALUE = 1_000_000_000_000_000;

export type ChartVizControlValues = Record<string, number>;

/** Returns the persisted baseline values for every declarative control. */
export function getDefaultChartVizControlValues(
  payload: ChartVizPayload,
): ChartVizControlValues {
  return Object.fromEntries(
    (payload.controls ?? []).map(({ key, defaultValue }) => [
      key,
      defaultValue,
    ]),
  );
}

/** Applies one allow-listed operation to a numeric point. */
const calculateValue = ({
  baseValue,
  controlValue,
  index,
  operation,
}: {
  baseValue: number;
  controlValue: number;
  index: number;
  operation: ChartVizTransformOperation;
}): number => {
  switch (operation) {
    case 'add':
      return baseValue + controlValue;
    case 'percent':
      return baseValue * (1 + controlValue / 100);
    case 'compoundPercent':
      return baseValue * Math.pow(1 + controlValue / 100, index + 1);
    default:
      return baseValue;
  }
};

/** Keeps transformed values finite and within the renderer's numeric budget. */
const boundRenderedValue = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(
    MAX_ABS_RENDERED_VALUE,
    Math.max(-MAX_ABS_RENDERED_VALUE, value),
  );
};

/**
 * Applies the small allow-listed transform language to an already sanitized
 * payload. This is deliberately an interpreter over data: it never evaluates
 * model-authored JavaScript, expressions, HTML, or property paths.
 */
export function applyChartVizTransforms(
  payload: ChartVizPayload,
  values: ChartVizControlValues,
): ChartVizPayload {
  if (!payload.transforms?.length) return payload;

  const data = payload.data.map((point, index) => {
    const next = { ...point };

    for (const transform of payload.transforms ?? []) {
      const current = next[transform.seriesKey];
      const controlValue = values[transform.controlKey];

      if (
        typeof current !== 'number' ||
        !Number.isFinite(current) ||
        typeof controlValue !== 'number' ||
        !Number.isFinite(controlValue)
      ) {
        continue;
      }

      next[transform.seriesKey] = boundRenderedValue(
        calculateValue({
          baseValue: current,
          controlValue,
          index,
          operation: transform.operation,
        }),
        current,
      );
    }

    return next;
  });

  return { ...payload, data };
}

/** Returns control values that can define an interactive domain extreme. */
const getControlCandidates = ({
  min,
  max,
  defaultValue,
}: {
  min: number;
  max: number;
  defaultValue: number;
}): number[] =>
  Array.from(
    new Set([
      min,
      max,
      defaultValue,
      ...(min <= 0 && max >= 0 ? [0] : []),
      ...(min <= -100 && max >= -100 ? [-100] : []),
    ]),
  );

/**
 * Calculates one axis domain across every meaningful control extreme. Keeping
 * this domain stable while sliders move makes the geometry visibly move;
 * auto-scaling each new data set would leave the same-looking curve in place
 * and change only its tick labels.
 */
export function getChartVizInteractiveDomain(
  payload: ChartVizPayload,
  { includeZero = false }: { includeZero?: boolean } = {},
): [number, number] | undefined {
  const controls = payload.controls ?? [];

  if (!controls.length || !payload.transforms?.length) return undefined;

  const candidates = controls.map(getControlCandidates);
  const seriesKeys = new Set(payload.series.map(({ key }) => key));
  let dataMin = Number.POSITIVE_INFINITY;
  let dataMax = Number.NEGATIVE_INFINITY;

  /** Visits the bounded cartesian product of meaningful control values. */
  const visit = (index: number, values: ChartVizControlValues) => {
    if (index < controls.length) {
      const control = controls[index];
      if (!control) return;

      for (const value of candidates[index] ?? []) {
        visit(index + 1, { ...values, [control.key]: value });
      }
      return;
    }

    const scenario = applyChartVizTransforms(payload, values);
    for (const point of scenario.data) {
      for (const key of seriesKeys) {
        const value = point[key];
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        dataMin = Math.min(dataMin, value);
        dataMax = Math.max(dataMax, value);
      }
    }
  };

  visit(0, getDefaultChartVizControlValues(payload));

  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) return undefined;

  if (!includeZero) return getChartVizTrendDomain([dataMin, dataMax]);

  dataMin = Math.min(0, dataMin);
  dataMax = Math.max(0, dataMax);
  const span = dataMax - dataMin;
  const padding = Math.max(span * 0.08, 1);

  return [
    dataMin < 0 ? dataMin - padding : 0,
    dataMax > 0 ? dataMax + padding : 0,
  ];
}
