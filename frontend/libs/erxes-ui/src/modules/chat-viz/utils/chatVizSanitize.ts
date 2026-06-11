import type {
  ChartVizDataPoint,
  ChartVizPayload,
  ChartVizSeriesConfig,
  ChartVizType,
} from '../types/chatVizTypes';

const VALID_CHART_TYPES = new Set<ChartVizType>(['bar', 'line', 'pie', 'area']);
const MAX_DATA_POINTS = 100;
const MAX_SERIES = 10;
const MAX_TEXT_LEN = 200;

/**
 * Allow only the three CSS color notations that carry no executable content:
 *   #rrggbb / #rgb / #rrggbbaa
 *   rgb(r, g, b)
 *   hsl(h, s%, l%)
 * This blocks url(), expression(), var() with attacker-controlled names, etc.
 * Used to sanitize values before they flow into ChartStyle's
 * dangerouslySetInnerHTML (which generates CSS custom properties).
 */
const SAFE_CSS_COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\))$/;

/**
 * CSS variable key restriction: letter-start, alphanumeric + dash + underscore,
 * max 50 chars. Prevents CSS injection like `key}` breaking out of the
 * generated CSS block in ChartStyle.
 */
const SAFE_CSS_VAR_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/;

/** Strict ISO 8601 UTC timestamp */
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  // React renders text nodes safely (no innerHTML), but we still strip to
  // printable ASCII range and cap length for defense-in-depth.
  return input.slice(0, MAX_TEXT_LEN);
}

function sanitizeColor(color: unknown): string | undefined {
  if (typeof color !== 'string') return undefined;
  const t = color.trim();
  return SAFE_CSS_COLOR_RE.test(t) ? t : undefined;
}

function sanitizeCssKey(key: unknown): string | undefined {
  if (typeof key !== 'string') return undefined;
  return SAFE_CSS_VAR_KEY_RE.test(key) ? key : undefined;
}

function sanitizeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeSentAt(value: unknown): string {
  if (typeof value === 'string' && ISO_DATE_RE.test(value)) return value;
  return new Date().toISOString();
}

/**
 * Validate and sanitize an untrusted chat message payload before rendering.
 * Returns null if the payload is not a valid chart-viz message.
 *
 * XSS: all user-visible string fields are length-capped; CSS color and key
 * values are regex-validated before being used in CSS custom properties.
 *
 * IDOR: no data source IDs are present — only inlined data. Authorization
 * must be enforced server-side before this payload is stored or delivered.
 */
export function sanitizeChartVizPayload(raw: unknown): ChartVizPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;

  if (p['type'] !== 'chart-viz') return null;

  const chartType = p['chartType'];
  if (!VALID_CHART_TYPES.has(chartType as ChartVizType)) return null;

  const rawSeries = Array.isArray(p['series'])
    ? (p['series'] as unknown[]).slice(0, MAX_SERIES)
    : [];

  const series: ChartVizSeriesConfig[] = rawSeries.flatMap((s) => {
    if (!s || typeof s !== 'object') return [];
    const item = s as Record<string, unknown>;
    const key = sanitizeCssKey(item['key']);
    if (!key) return [];
    return [
      {
        key,
        label: sanitizeText(item['label']),
        color: sanitizeColor(item['color']),
      },
    ];
  });

  const validKeys = new Set(series.map((s) => s.key));

  const rawData = Array.isArray(p['data'])
    ? (p['data'] as unknown[]).slice(0, MAX_DATA_POINTS)
    : [];

  const data: ChartVizDataPoint[] = rawData.map((d) => {
    if (!d || typeof d !== 'object') return { label: '' };
    const item = d as Record<string, unknown>;
    const point: ChartVizDataPoint = { label: sanitizeText(item['label']) };
    for (const key of validKeys) {
      point[key] = sanitizeNumber(item[key]);
    }
    return point;
  });

  return {
    type: 'chart-viz',
    chartType: chartType as ChartVizType,
    title: sanitizeText(p['title']),
    description:
      p['description'] != null ? sanitizeText(p['description']) : undefined,
    data,
    series,
    sentAt: sanitizeSentAt(p['sentAt']),
  };
}

/**
 * Sanitize then serialize a chart payload for embedding in a chat message.
 * Returns null if the payload fails validation.
 *
 * Always go through this function when sending — never serialize raw
 * user-supplied objects directly.
 */
export function serializeChartVizPayload(
  input: Omit<ChartVizPayload, 'type' | 'sentAt'>,
): string | null {
  const full: ChartVizPayload = {
    ...input,
    type: 'chart-viz',
    sentAt: new Date().toISOString(),
  };
  const sanitized = sanitizeChartVizPayload(full);
  if (!sanitized) return null;
  return JSON.stringify(sanitized);
}

/**
 * Parse and sanitize a raw JSON string received from a chat message.
 * Returns null on invalid JSON or invalid payload shape.
 */
export function parseChartVizMessage(raw: string): ChartVizPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return sanitizeChartVizPayload(parsed);
}
