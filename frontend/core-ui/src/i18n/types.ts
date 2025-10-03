import type { Locale } from 'date-fns';

export type Language = {
  code: string;
  display_name: string;
  ltr: boolean;
  date_locale: Locale;
};
