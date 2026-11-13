import { useStageName } from '~/modules/leads/i18n';

/** Contact list filters: the default lead stages read in the UI's language. */
export const useContactOptionLabel = () => {
  const stageName = useStageName();

  return (path: string, value: string) =>
    path === 'subject.leadStageId' ? stageName(value) : value;
};
