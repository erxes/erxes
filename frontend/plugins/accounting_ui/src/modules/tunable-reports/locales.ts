import { useTranslation } from 'react-i18next';
import type { i18n, TFunction } from 'i18next';

export const useReportTranslation = (): {
  t: TFunction;
  i18n: i18n;
  ready: boolean;
} => useTranslation('accounting', { keyPrefix: 'tunable-report' });
