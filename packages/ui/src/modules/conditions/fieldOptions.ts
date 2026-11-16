import { useTranslation } from 'react-i18next';
import { useMemberOptions, useTagOptions } from '../pickers/LookupPicker';
import type { TConditionField, TConditionLookups } from './conditions';

/**
 * What a choice field picks from, with labels: its `options`, the team ("Me" first), or the
 * record type's tags. `picked` are the ids a rule holds, so a member who left still has a name.
 */
export const useFieldOptions = (
  field: TConditionField | undefined,
  lookups: TConditionLookups,
  picked: readonly string[] = [],
) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const members = useMemberOptions(lookups.members, field?.type === 'member', picked);
  const tags = useTagOptions(lookups.tags, field?.type === 'tags');

  if (field?.type === 'member') {
    return { ...members, options: [{ value: 'me', label: t('me', 'Me') }, ...members.options] };
  }

  if (field?.type === 'tags') return tags;

  return { options: field?.options ?? [], loading: false, error: null };
};
