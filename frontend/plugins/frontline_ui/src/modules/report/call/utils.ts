import { formatSeconds } from '@/integrations/call/utils/callUtils';
import type { SelectOption } from './types';

export const fmt = (n: number | null | undefined, decimals = 1): string =>
  (n ?? 0).toFixed(decimals);

export const fmtPct = (n: number | null | undefined): string => `${fmt(n)}%`;

export const fmtDur = (n: number | null | undefined): string =>
  formatSeconds(Math.round(n ?? 0));

export const fmtNum = (n: number | null | undefined): string =>
  (n ?? 0).toLocaleString();

export const NO_DATA = '—';

export const NO_QUEUE = '__no_queue__';

export const fmtPctOrDash = (n: number | null | undefined): string =>
  n == null ? NO_DATA : fmtPct(n);

export const fmtDurOrDash = (n: number | null | undefined): string =>
  n == null ? NO_DATA : fmtDur(n);

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

export function detectCarrier(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  const national =
    digits.length === 11 && digits.startsWith('976') ? digits.slice(3) : digits;

  if (national.startsWith('696')) return 'Skytel';

  return CARRIER_BY_PREFIX[national.slice(0, 2)] ?? 'Other';
}

export const CARRIER_COLOR_VAR: Record<string, string> = {
  Mobicom: 'var(--carrier-mobicom)',
  Unitel: 'var(--carrier-unitel)',
  Skytel: 'var(--carrier-skytel)',
  'G-Mobile': 'var(--carrier-gmobile)',
  Ondo: 'var(--carrier-ondo)',
  Other: 'var(--muted-foreground)',
};

export function normalizeQueue(
  queue: string | { _id?: string; name?: string; queue?: string },
): SelectOption | null {
  if (typeof queue === 'string') return { label: queue, value: queue };
  const value = queue.name || queue._id || queue.queue;
  if (!value) return null;
  return { label: queue.name || String(value), value: String(value) };
}

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
