import type { DynamicBinding } from './template.types';

const PATH_TOKEN_REGEX = /[^.[\]]+|\[(\d+)\]/g;

export const tokenizeBindingPath = (path: string): Array<string | number> => {
  const matches = path.match(PATH_TOKEN_REGEX) || [];

  return matches.map((token) =>
    token.startsWith('[') ? Number(token.slice(1, -1)) : token,
  );
};

export const resolveBindingPath = (
  source: Record<string, unknown>,
  path: string,
): unknown => {
  const tokens = tokenizeBindingPath(path);

  return tokens.reduce<unknown>((acc, token) => {
    if (acc === null || acc === undefined) return undefined;

    if (typeof token === 'number' && Array.isArray(acc)) {
      return acc[token];
    }

    if (typeof token === 'string' && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[token];
    }

    return undefined;
  }, source);
};

const formatResolvedValue = (
  value: unknown,
  binding: DynamicBinding,
  locale: string,
): string => {
  if (value === null || value === undefined || value === '') {
    return binding.fallback || '';
  }

  if (binding.formatter === 'currency' && typeof value === 'number') {
    const currency =
      typeof binding.formatOptions?.currency === 'string'
        ? binding.formatOptions.currency
        : 'USD';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (binding.formatter === 'date') {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  }

  if (binding.formatter === 'uppercase') {
    return String(value).toUpperCase();
  }

  if (binding.formatter === 'lowercase') {
    return String(value).toLowerCase();
  }

  if (binding.formatter === 'join' && Array.isArray(value)) {
    const separator =
      typeof binding.formatOptions?.separator === 'string'
        ? binding.formatOptions.separator
        : ', ';
    return value.join(separator);
  }

  return String(value);
};

export const resolveDynamicBinding = ({
  binding,
  data,
  locale = 'en',
}: {
  binding: DynamicBinding;
  data: Record<string, unknown>;
  locale?: string;
}): string => {
  const value = resolveBindingPath(data, binding.path);
  return formatResolvedValue(value, binding, locale);
};
