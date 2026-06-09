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

/**
 * Detect carrier from phone-number prefix (first 2 digits).
 * Returns the carrier name string.
 */
export function detectCarrier(phone: string): string {
  const prefix = phone.replace(/^\+976/, '').slice(0, 2);
  const map: Record<string, string> = {
    '99': 'Mobicom',
    '95': 'Mobicom',
    '85': 'Mobicom',
    '89': 'Unitel',
    '96': 'Unitel',
    '91': 'Skytel',
    '94': 'Skytel',
    '90': 'Skytel',
    '98': 'G-Mobile',
    '93': 'G-Mobile',
    '97': 'Ondo',
  };
  return map[prefix] ?? 'Unknown';
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
