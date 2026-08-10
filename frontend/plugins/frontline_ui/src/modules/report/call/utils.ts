import { formatSeconds } from '@/integrations/call/utils/callUtils';
import type { SelectOption } from './types';

/** Format a number to fixed decimals (defaults 1). */
export const fmt = (n: number | null | undefined, decimals = 1): string =>
  (n ?? 0).toFixed(decimals);

/** Format a number as a percentage string, e.g. "83.5%". */
export const fmtPct = (n: number | null | undefined): string => `${fmt(n)}%`;

/** Format a seconds value as a human-readable duration. */
export const fmtDur = (n: number | null | undefined): string =>
  formatSeconds(Math.round(n ?? 0));

/** Format a number with locale thousands separators. */
export const fmtNum = (n: number | null | undefined): string =>
  (n ?? 0).toLocaleString();

/**
 * Shown in place of a metric the backend could not measure. Distinct from a
 * real `0`, which means "measured, and it was zero".
 */
export const NO_DATA = '—';

/** Percentage, or `—` when the backend returned no measurement. */
export const fmtPctOrDash = (n: number | null | undefined): string =>
  n == null ? NO_DATA : fmtPct(n);

/** Duration, or `—` when the backend returned no measurement. */
export const fmtDurOrDash = (n: number | null | undefined): string =>
  n == null ? NO_DATA : fmtDur(n);

/** Days-of-week labels indexed 1–7 (Mon–Sun, matching $isoDayOfWeek). */
export const DOW_LABELS: string[] = [
  '',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

/**
 * Carrier colour CSS custom properties in insertion order.
 * Use `var(--carrier-mobicom)` etc. directly in components.
 */
export const CARRIER_CSS_VARS: string[] = [
  'var(--carrier-mobicom)',
  'var(--carrier-unitel)',
  'var(--carrier-skytel)',
  'var(--carrier-gmobile)',
  'var(--carrier-ondo)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
];

/** Mongolian mobile prefixes, keyed on the first two digits of the number. */
const CARRIER_BY_PREFIX: Record<string, string> = {
  '85': 'Mobicom',
  '94': 'Mobicom',
  '95': 'Mobicom',
  '99': 'Mobicom',
  '80': 'Unitel',
  '86': 'Unitel',
  '88': 'Unitel',
  '89': 'Unitel',
  '90': 'Skytel',
  '91': 'Skytel',
  '92': 'Skytel',
  '96': 'Skytel',
  '83': 'G-Mobile',
  '93': 'G-Mobile',
  '97': 'G-Mobile',
  '98': 'G-Mobile',
  '60': 'Ondo',
  '66': 'Ondo',
};

/**
 * Detect the carrier from a phone-number prefix.
 *
 * Two digits identify every allocated range except Skytel's `696XXXXX`, which
 * needs three — `69` alone is not allocated. Unallocated ranges (`81`, `82`,
 * `84`, `87`) and landlines return `Unknown`.
 *
 * Mirrors `carrierExpression` in `frontline_api`'s call report service, which
 * is what actually labels the report data; keep the two in step.
 */
export function detectCarrier(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Only an 11-digit number carries the country code — `976XXXXX` on its own is
  // a valid 8-digit G-Mobile number and must keep its `97` prefix.
  const national =
    digits.length === 11 && digits.startsWith('976') ? digits.slice(3) : digits;

  if (national.startsWith('696')) return 'Skytel';

  return CARRIER_BY_PREFIX[national.slice(0, 2)] ?? 'Unknown';
}

/** Map carrier name → CSS custom property variable string. */
export const CARRIER_COLOR_VAR: Record<string, string> = {
  Mobicom: 'var(--carrier-mobicom)',
  Unitel: 'var(--carrier-unitel)',
  Skytel: 'var(--carrier-skytel)',
  'G-Mobile': 'var(--carrier-gmobile)',
  Ondo: 'var(--carrier-ondo)',
};

/**
 * Normalise a raw queue value (string | object) to a SelectOption.
 * Returns null if the value is empty.
 */
export function normalizeQueue(
  queue: string | { _id?: string; name?: string; queue?: string },
): SelectOption | null {
  if (typeof queue === 'string') return { label: queue, value: queue };
  const value = queue.name || queue._id || queue.queue;
  if (!value) return null;
  return { label: queue.name || String(value), value: String(value) };
}

/**
 * Collapse duplicate integrations by inboxId, joining phone numbers.
 */
export function deduplicateIntegrations(
  integrations: Array<{
    inboxId: string;
    phone: string;
    [key: string]: unknown;
  }>,
): Array<{ inboxId: string; phone: string }> {
  const map = new Map<string, { inboxId: string; phone: string }>();
  for (const integration of integrations) {
    const phone = formatPhoneStr(integration.phone);
    if (map.has(integration.inboxId)) {
      const existing = map.get(integration.inboxId)!;
      if (!existing.phone.includes(phone)) {
        existing.phone += `, ${phone}`;
      }
    } else {
      map.set(integration.inboxId, { ...integration, phone });
    }
  }
  return Array.from(map.values());
}

function formatPhoneStr(phone: string): string {
  if (!phone) return '';
  if (phone.includes(','))
    return phone
      .split(',')
      .map((p) => p.trim())
      .join(', ');
  if (/^\d+$/.test(phone) && phone.length > 8 && phone.length % 8 === 0) {
    return phone.match(/.{1,8}/g)?.join(', ') || phone;
  }
  return phone;
}
