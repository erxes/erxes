import { useTranslation } from 'react-i18next';
import { useContactOptions, useMemberOptions, useTagOptions } from '../pickers/LookupPicker';
import type { TConditionField, TConditionLookups } from './conditions';

/**
 * What a choice field picks from, with labels: its `options`, the team ("Me" first), the
 * record type's tags, or customers or companies matching `search` (`searched`: the server
 * searches). `picked` are the ids a rule holds, so a member who left still has a name.
 */
export const useFieldOptions = (
  field: TConditionField | undefined,
  lookups: TConditionLookups,
  picked: readonly string[] = [],
  search = '',
) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const type = field?.type;
  const members = useMemberOptions(lookups.members, type === 'member', picked);
  const tags = useTagOptions(lookups.tags, type === 'tags');

  const contacts = useContactOptions(
    lookups.contacts,
    type === 'customer' || type === 'company' ? type : null,
    picked,
    search,
  );

  if (type === 'member') {
    return {
      ...members,
      options: [{ value: 'me', label: t('me', 'Me') }, ...members.options],
      searched: false,
    };
  }

  if (type === 'tags') return { ...tags, searched: false };

  if (type === 'customer' || type === 'company') return { ...contacts, searched: true };

  return { options: field?.options ?? [], loading: false, error: null, searched: false };
};
