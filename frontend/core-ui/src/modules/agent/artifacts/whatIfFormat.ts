import type { WhatIfChartInput, WhatIfChartOutput } from './whatIfChartModel';

type WhatIfField = Pick<
  WhatIfChartInput | WhatIfChartOutput,
  'unit' | 'format' | 'currency' | 'decimals'
>;

export type WhatIfValueKind =
  | { kind: 'currency'; currency: string }
  | { kind: 'percent' }
  | { kind: 'number'; unit?: string };

export type WhatIfTone = 'positive' | 'negative' | 'neutral';

const CURRENCY_SYMBOLS: Record<string, string> = {
  '₮': 'MNT',
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

const formatters = new Map<string, Intl.NumberFormat>();
const numberFormat = (
  locale: string | undefined,
  options: Intl.NumberFormatOptions,
) => {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
};

const supportsCurrency = (currency: string) => {
  try {
    numberFormat('en', { style: 'currency', currency });
    return true;
  } catch {
    return false;
  }
};

/** Explicit `format` wins; legacy specs infer currency/percent from `unit`. */
export const resolveWhatIfKind = (field: WhatIfField): WhatIfValueKind => {
  const unit = field.unit?.trim() || undefined;
  if (field.format === 'percent' || (!field.format && unit === '%'))
    return { kind: 'percent' };
  const currency =
    field.currency ??
    (unit && /^[A-Z]{3}$/.test(unit) ? unit : undefined) ??
    (unit ? CURRENCY_SYMBOLS[unit] : undefined);
  if (field.format !== 'number' && currency && supportsCurrency(currency))
    return { kind: 'currency', currency };
  return { kind: 'number', unit: unit === '%' ? undefined : unit };
};

/** Outputs sharing a key can share one bar scale. */
export const whatIfScaleKey = (field: WhatIfField) => {
  const kind = resolveWhatIfKind(field);
  return kind.kind === 'currency'
    ? `currency:${kind.currency}`
    : kind.kind === 'percent'
    ? 'percent'
    : `number:${kind.unit ?? ''}`;
};

/** Default precision: whole numbers for large amounts, cents for small ones. */
export const whatIfAutoDecimals = (value: number) => {
  const magnitude = Math.abs(value);
  return magnitude >= 1000 ? 0 : magnitude >= 100 ? 1 : 2;
};

/** Precision implied by an input's step, e.g. 0.1 → 1 decimal. */
export const whatIfStepDecimals = (step: number) => {
  const text = String(step);
  const exponent = text.match(/e-(\d+)$/);
  if (exponent) return Math.min(6, Number(exponent[1]));
  const point = text.indexOf('.');
  return point < 0 ? 0 : Math.min(6, text.length - point - 1);
};

export type WhatIfFormatOptions = {
  locale?: string;
  /** Abbreviates large values (₮119M) for narrow chart labels. */
  compact?: boolean;
  /** Prefix positive values with "+". */
  sign?: boolean;
  /** Omit the currency symbol, percent sign or unit. */
  plain?: boolean;
  decimals?: number;
};

export const formatWhatIfValue = (
  value: number | null,
  field: WhatIfField,
  options: WhatIfFormatOptions = {},
): string => {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  const kind = resolveWhatIfKind(field);
  const decimals = options.decimals ?? field.decimals;
  const base: Intl.NumberFormatOptions =
    options.compact && Math.abs(value) >= 10_000
      ? { notation: 'compact', maximumSignificantDigits: 3 }
      : {
          minimumFractionDigits: decimals ?? 0,
          maximumFractionDigits: decimals ?? whatIfAutoDecimals(value),
        };
  if (options.sign) base.signDisplay = 'exceptZero';
  if (kind.kind === 'currency' && !options.plain)
    return numberFormat(options.locale, {
      ...base,
      style: 'currency',
      currency: kind.currency,
      currencyDisplay: 'narrowSymbol',
    }).format(value);
  const text = numberFormat(options.locale, base).format(value);
  if (options.plain) return text;
  if (kind.kind === 'percent') return `${text}%`;
  return kind.unit ? `${text} ${kind.unit}` : text;
};

/** Field adornments: a currency symbol in its locale position, %, or a unit. */
export const whatIfAffixes = (
  field: WhatIfField,
  locale?: string,
): { prefix?: string; suffix?: string } => {
  const kind = resolveWhatIfKind(field);
  if (kind.kind === 'percent') return { suffix: '%' };
  if (kind.kind === 'number') return kind.unit ? { suffix: kind.unit } : {};
  const parts = numberFormat(locale, {
    style: 'currency',
    currency: kind.currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(1);
  const symbol = parts.findIndex((part) => part.type === 'currency');
  const integer = parts.findIndex((part) => part.type === 'integer');
  const text = parts[symbol]?.value ?? kind.currency;
  return symbol >= 0 && symbol < integer ? { prefix: text } : { suffix: text };
};

/** Raw editable text without grouping, using the locale's decimal mark. */
export const formatWhatIfEditable = (value: number, locale?: string) =>
  numberFormat(locale, {
    useGrouping: false,
    maximumFractionDigits: 6,
  }).format(value);

/** Accepts locale grouping/decimal marks and stray affixes; rejects anything else. */
export const parseWhatIfNumber = (
  raw: string,
  locale?: string,
): number | null => {
  const parts = numberFormat(locale, {}).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  let text = raw
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(/^[\u2212\u2013]/, '-');
  text = text.split(group).join('');
  if (decimal !== '.') text = text.split(decimal).join('.');
  text = text.replace(/[%₮$€£¥]/g, '');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

const isZeroChange = (change: number, baseline: number) =>
  Math.abs(change) <= 1e-9 * Math.max(1, Math.abs(baseline));

export const whatIfChange = (
  baseline: number | null,
  scenario: number | null,
) => {
  if (baseline === null || scenario === null) return null;
  const absolute = isZeroChange(scenario - baseline, baseline)
    ? 0
    : scenario - baseline;
  return {
    absolute,
    relative: baseline === 0 ? null : (absolute / Math.abs(baseline)) * 100,
  };
};

/** Small changes keep two significant digits so they never read as "0%". */
export const formatWhatIfPercentChange = (
  relative: number,
  locale?: string,
) => {
  const magnitude = Math.abs(relative);
  return `${numberFormat(
    locale,
    magnitude >= 10
      ? { maximumFractionDigits: 0, signDisplay: 'exceptZero' }
      : magnitude >= 1
      ? { maximumFractionDigits: 1, signDisplay: 'exceptZero' }
      : { maximumSignificantDigits: 2, signDisplay: 'exceptZero' },
  ).format(relative)}%`;
};

/** "+12%" for amounts, "+3.2 pp" for percentage-point inputs; null when unchanged. */
export const formatWhatIfInputDelta = (
  baseline: number,
  value: number,
  field: WhatIfField,
  locale?: string,
) => {
  const change = whatIfChange(baseline, value);
  if (!change || change.absolute === 0) return null;
  if (resolveWhatIfKind(field).kind === 'percent')
    return `${formatWhatIfValue(change.absolute, field, {
      locale,
      sign: true,
      plain: true,
    })} pp`;
  return change.relative === null
    ? formatWhatIfValue(change.absolute, field, { locale, sign: true })
    : formatWhatIfPercentChange(change.relative, locale);
};

export const whatIfTone = (
  absolute: number,
  better: 'higher' | 'lower' = 'higher',
): WhatIfTone =>
  absolute === 0
    ? 'neutral'
    : absolute > 0 === (better === 'higher')
    ? 'positive'
    : 'negative';
