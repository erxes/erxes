import { createContext, useContext } from 'react';
import type { TConditionGroup, TConditionLookups } from '../../conditions/conditions';
import type { TFilterRule } from '../../conditions/filterRule';
import type { TListFilterField } from '../ListFilter';
import type { FilterPart } from './filterRules';

/** Where the field picker opens: from the view bar's filter button, or the filter row's "+ Filter". */
export type AddFrom = 'bar' | 'row';

/** What the filter row, its chips, the field picker and the advanced filter share. */
export interface ListFilterState {
  fields: TListFilterField[];
  /** Where `member` and `tags` fields pick from. */
  lookups: TConditionLookups;
  /** The list's filter. */
  advanced: TConditionGroup | null;
  /** The filter as chips; null when it needs the advanced filter (an "or", a nested group). */
  chips: TFilterRule[] | null;
  /** The parts that must all hold (`partsOf`): the chips, or the advanced filter as one. */
  parts: FilterPart[];
  /** Changes a part as `withPart` does. */
  setPart: (index: number | null, next: FilterPart | null) => void;
  setAdvanced: (next: TConditionGroup | null) => void;
  /** The field picker that is open. */
  adding: AddFrom | null;
  setAdding: (from: AddFrom | null) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
  /** While the fields load, and why they didn't; the field picker says so. */
  loading?: boolean;
  error?: Error | null;
  /** How many records match, for the advanced filter's "N match". */
  totalCount?: number | null;
  totalCapped?: boolean;
}

export const ListFilterContext = createContext<ListFilterState | null>(null);

export const useListFilter = () => {
  const state = useContext(ListFilterContext);

  if (!state) throw new Error('useListFilter is only available inside <ListFilter>');

  return state;
};

/** A field by its path; one no list field has (a removed property) reads as text. */
export const useFieldAt = (path: string): TListFilterField => {
  const { fields } = useListFilter();

  return fields.find((field) => field.path === path) ?? { path, label: path, type: 'text' };
};
