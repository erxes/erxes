import type { ViewRecordType } from '@erxes/core-contract';
import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberOptions, useTagOptions } from '~/modules/automations/builder/lookupOptions';
import { type ListField, subjectOf } from '../useViews';
import type { FilterPart } from './filterRules';

/** What the filter menu, its chips and the advanced filter share. */
export interface ListFilterState {
  recordType: ViewRecordType;
  fields: ListField[];
  /** The list's filter as parts that must all hold (`partsOf`). */
  parts: FilterPart[];
  /** Changes the filter as `withPart` does. */
  setPart: (index: number | null, next: FilterPart | null) => void;
  /** The part a chip opened the menu on. */
  editing: number | null;
  /** Opens the menu on a chip's part, or the advanced filter when the menu can't show it. */
  edit: (index: number) => void;
  openAdvanced: () => void;
  /** How a choice field's value reads (a product type, a plugin's title); the value itself otherwise. */
  optionLabel?: (path: string, value: string) => string;
}

export const ListFilterContext = createContext<ListFilterState | null>(null);

export const useListFilter = () => {
  const state = useContext(ListFilterContext);

  if (!state) throw new Error('useListFilter is only available inside <ListFilter>');

  return state;
};

/** What a choice field picks from: its options, the team ("Me" first), or the list's tags. */
export const useFieldOptions = (field: ListField) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { recordType, optionLabel } = useListFilter();
  const subject = subjectOf(recordType);
  const members = useMemberOptions(field.type === 'member');
  const tags = useTagOptions(subject ?? 'customer', field.type === 'tags' && subject !== null);

  if (field.type === 'member') {
    return {
      ...members,
      options: [{ value: 'me', label: t('me') }, ...members.options],
    };
  }

  if (field.type === 'tags') return tags;

  return {
    options: (field.options ?? []).map((value) => ({
      value,
      label: optionLabel?.(field.path, value) ?? value,
    })),
    loading: false,
    error: null,
  };
};
