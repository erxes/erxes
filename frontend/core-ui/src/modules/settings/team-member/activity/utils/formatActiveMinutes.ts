import { TFunction } from 'i18next';

export const formatActiveMinutes = (t: TFunction, minutes: number) =>
  t('active-duration', {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  });
