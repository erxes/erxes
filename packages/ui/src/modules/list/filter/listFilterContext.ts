import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { isRule, type TConditionLookups } from '../../conditions/conditions';
import { useMemberOptions, useTagOptions } from '../../pickers/LookupPicker';
import type { TListFilterField } from '../ListFilter';
import { type FilterPart, valuesOf } from './filterRules';

/** What the filter menu, its chips and the advanced filter share. */
export interface ListFilterState {
  fields: TListFilterField[];
  /** Where `member` and `tags` fields pick from. */
  lookups: TConditionLookups;
  /** The list's filter as parts that must all hold (`partsOf`). */
  parts: FilterPart[];
  /** Changes the filter as `withPart` does. */
  setPart: (index: number | null, next: FilterPart | null) => void;
  /** The part a chip opened the menu on. */
  editing: number | null;
  /** Opens the menu on a chip's part, or the advanced filter when the menu can't show it. */
  edit: (index: number) => void;
  openAdvanced: () => void;
}

export const ListFilterContext = createContext<ListFilterState | null>(null);

export const useListFilter = () => {
  const state = useContext(ListFilterContext);

  if (!state) throw new Error('useListFilter is only available inside <ListFilter>');

  return state;
};

/** What a choice field picks from: its options, the team ("Me" first), or the list's tags. */
export const useFieldOptions = (field: TListFilterField) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { lookups, parts } = useListFilter();

  const picked = parts.flatMap((part) =>
    isRule(part) && part.path === field.path ? valuesOf(part) : [],
  );

  const members = useMemberOptions(lookups.members, field.type === 'member', picked);
  const tags = useTagOptions(lookups.tags, field.type === 'tags');

  if (field.type === 'member') {
    return { ...members, options: [{ value: 'me', label: t('me', 'Me') }, ...members.options] };
  }

  if (field.type === 'tags') return tags;

  return { options: field.options ?? [], loading: false, error: null };
};
