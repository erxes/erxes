import { useTranslation } from 'react-i18next';
import { LEADS_NS, useStageName } from '~/modules/leads/i18n';
import { en } from '~/modules/leads/i18n.en';

/**
 * Contact list filters: the default lead stages, the states and the sources read in the UI's
 * language; a source a plugin sent reads as written.
 */
export const useContactOptionLabel = () => {
  const { t } = useTranslation(LEADS_NS);
  const stageName = useStageName();

  return (path: string, value: string) => {
    if (path === 'subject.leadStageId') return stageName(value);

    if (path === 'subject.state' && value in en.states) return t(`states.${value}`, value);

    if (path === 'subject.source' && value in en['source-names']) {
      return t(`source-names.${value}`, value);
    }

    return value;
  };
};
