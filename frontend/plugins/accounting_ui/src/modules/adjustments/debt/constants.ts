import { CURRENCY_CODES } from 'erxes-ui/constants';

export const COMMON_CURRENCIES = [
  'MNT',
  'USD',
  'CNY',
  'EUR',
  'RUB',
  'KRW',
  'JPY',
  'GBP',
];

export const FILTERED_CURRENCIES = Object.fromEntries(
  Object.entries(CURRENCY_CODES).filter(([code]) =>
    COMMON_CURRENCIES.includes(code),
  ),
) as typeof CURRENCY_CODES;
