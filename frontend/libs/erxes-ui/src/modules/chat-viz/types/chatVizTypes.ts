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
  /** ISO 8601 timestamp of when the sender composed the chart */
  sentAt: string;
};
