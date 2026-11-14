import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n } from '~/i18n';
import { en } from './i18n.en';
import { mn } from './i18n.mn';

/** Strings of the lead screens (stages, board, actions, insights, views). */
export const LEADS_NS = 'core-leads';

i18n.addResourceBundle('en', LEADS_NS, en, true, false);

i18n.addResourceBundle('mn', LEADS_NS, mn, true, false);

/** The lead screens' translator. */
export const useLeadsT = () => useTranslation(LEADS_NS).t;

/** A stage's name: the default ones translated, the organisation's own as written. */
export const useStageName = () => {
  const { t } = useTranslation(LEADS_NS);

  return useCallback(
    (name: string | undefined | null) =>
      name && name in en.defaults ? t(`defaults.${name}`, name) : (name ?? ''),
    [t],
  );
};
