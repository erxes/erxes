import { cookies } from 'next/headers';
import { cache } from 'react';
import { readConfig } from '@/modules/config/api';
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from './locales';
import { createTranslate, type Translate } from './translate';

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;

  if (isLocale(chosen)) {
    return chosen;
  }

  const config = await readConfig();
  const configured = config?.languageCode?.slice(0, 2).toLowerCase();

  return isLocale(configured) ? configured : DEFAULT_LOCALE;
});

export const getT = async (): Promise<Translate> =>
  createTranslate(await getLocale());
