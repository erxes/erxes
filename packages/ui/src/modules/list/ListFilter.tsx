import { parseAsString, useQueryStates } from 'nuqs';
import type { ElementType, ReactNode } from 'react';
import { z } from 'zod';
import { hostComponent } from '../../utils/host-component';

/** A field a plugin's list filters by, as its menu, chip and the advanced filter show it. */
export type TListFilterField = {
  /** The rules' `path` in the filter the list's API gets: `subject.<column>`, e.g. `subject.stageId`. */
  path: `subject.${string}`;
  label: string;
  /** How it compares: contains (text), ranges (number), relative dates, yes/no, a pick. */
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'member';
  /** A `select`'s choices. */
  options?: { value: string; label: string }[];
  /** Instead of the type's icon. */
  icon?: ElementType;
};

export type TListFilterProps = {
  /** Unique per list, e.g. `sales-deals`: its menu's hotkey scope. */
  id: string;
  fields: TListFilterField[];
  /** How many records match, shown after the chips; undefined while it loads. */
  totalCount?: number | null;
  /** The count stopped at its cap ("1,000+"). */
  totalCapped?: boolean;
  /** The list's own controls, before the menu: `DisplayMenu`, an Archived toggle. */
  children?: ReactNode;
};

const listFilter = hostComponent<TListFilterProps>();

/** Web registers core's filter bar. */
export const setListFilter = listFilter.set;

/**
 * A plugin list's filter bar, core's own: the menu of `fields` (`F`), search, the advanced
 * filter, and each condition as a chip. The conditions and search live in the address (shared
 * links and reloads keep them); `useListFilterParams()` reads them for the list's query.
 */
export const ListFilter = listFilter.Host;

const FilterGroup = z.looseObject({ rules: z.array(z.unknown()).min(1) });

/** The filter as JSON text when it has a condition; anything else in the address reads as none. */
const filterText = (text: string | null) => {
  if (!text) return undefined;

  try {
    return FilterGroup.safeParse(JSON.parse(text)).success ? text : undefined;
  } catch {
    return undefined;
  }
};

/**
 * What `ListFilter` holds, for the list's API: `filter`, core's condition group
 * (`ConditionGroup` from `@erxes/core-contract`) as JSON, its rules on the fields' paths,
 * and `search`. Both are undefined when unset.
 */
export const useListFilterParams = () => {
  const [{ advanced, searchValue }] = useQueryStates({
    advanced: parseAsString,
    searchValue: parseAsString,
  });

  return { filter: filterText(advanced), search: searchValue || undefined };
};
