export type ChartVizType = 'bar' | 'line' | 'pie' | 'area';

export type ChartVizDataPoint = {
  label: string;
  [key: string]: string | number;
};

export type ChartVizSeriesConfig = {
  /** CSS-safe key — validated to /^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/ */
  key: string;
  label: string;
  /** Optional override; must be hex, rgb(), or hsl() — validated on ingest */
  color?: string;
};

export type ChartVizSliderControl = {
  type: 'slider';
  /** Stable CSS-safe key referenced by transforms. */
  key: string;
  label: string;
  description?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  /** Display-only decorations; they never participate in calculations. */
  valuePrefix?: string;
  valueSuffix?: string;
};

export type ChartVizTransformOperation = 'add' | 'percent' | 'compoundPercent';

export type ChartVizTransform = {
  controlKey: string;
  seriesKey: string;
  operation: ChartVizTransformOperation;
};

/**
 * Wire format for a chart embedded in a chat message.
 *
 * IDOR contract: data is embedded directly — no IDs that trigger server
 * fetches are stored here. Authorization for which data a user may see must
 * be enforced on the server *before* this payload is created and stored in
 * the message log.
 */
export type ChartVizPayload = {
  type: 'chart-viz';
  chartType: ChartVizType;
  title: string;
  description?: string;
  data: ChartVizDataPoint[];
  series: ChartVizSeriesConfig[];
  /** Optional declarative interactivity. No model-authored code is executed. */
  controls?: ChartVizSliderControl[];
  transforms?: ChartVizTransform[];
  /** ISO 8601 timestamp of when the sender composed the chart */
  sentAt: string;
};
