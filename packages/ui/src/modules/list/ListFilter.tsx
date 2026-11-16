import { useAutoAnimate } from '@formkit/auto-animate/react';
import { type ElementType, lazy, type ReactNode, Suspense } from 'react';
import type { TConditionLookups } from '../conditions/conditions';
import { Filter } from '../filter/components/Filter';
import { useListConditions } from './filter/listFilterQuery';
import { type TPluginListType, useListViews } from './ViewBar';

/**
 * The bar, fetched the first time a list renders one: erxes-ui is one shared chunk every route
 * loads, and the bar with its condition editor is too much of it for pages without a list.
 */
const ListFilterBar = lazy(async () => ({
  default: (await import('./filter/ListFilterBar')).ListFilterBar,
}));

/**
 * A field a list can filter by, for `ListFilter`'s `fields`.
 * Its menu, chips and the advanced filter show it.
 */
export type TListFilterField = {
  /** The rules' `path` in the filter the list's API gets: `subject.<column>`, e.g. `subject.stageId`. */
  path: string;
  label: string;
  /**
   * How it compares: contains (text), ranges (number), relative dates, yes/no, a pick from
   * `options`, a team member (from `members`), a tag (from `tags`).
   */
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'member' | 'tags';
  /** A `select`'s choices. */
  options?: { value: string; label: string }[];
  /** Instead of the type's icon. */
  icon?: ElementType;
  /** The menu's heading it lists under; `fields` by default. */
  group?: 'fields' | 'lead' | 'company' | 'activity' | 'custom';
  /** A `number` that is money: stored in this currency's smallest unit, typed in its major one. */
  currency?: string;
};

/** The props of `ListFilter`: its `id`, `fields`, lookups and record count. */
export type TListFilterProps = TConditionLookups & {
  /** Unique per list, e.g. `sales-deals`: its menu's hotkey scope. */
  id: string;
  fields: TListFilterField[];
  /** How many records match, shown after the chips; undefined while it loads. */
  totalCount?: number | null;
  /** The count stopped at its cap ("1,000+"). */
  totalCapped?: boolean;
  /** The list's own controls, before the menu: `DisplayMenu`, an Archived toggle. */
  children?: ReactNode;
  /** While `fields` load, and why they didn't; the menu says so. */
  loading?: boolean;
  error?: Error | null;
  /** Beside the chips, before the count: what a saved view changed. */
  status?: ReactNode;
  /**
   * The list's record type, `<plugin>:<record>`, as its `ViewBar` has it: while the list differs
   * from its saved view, the bar offers to reset it or save it as a view.
   */
  recordType?: TPluginListType;
};

/**
 * A list's filter bar, with a field menu, search and conditions as chips.
 * The menu of `fields` opens on `F` and holds search and the advanced filter. The conditions
 * and search live in the address (shared links and reloads keep them); `useListFilterParams()`
 * reads them for the list's query. `member` fields pick
 * from `members` and `tags` fields from `tags`: in erxes `memberQueries` from
 * `@erxes/core-contract/client` and the tags query of the record type; outside erxes, the
 * plugin's own.
 */
export const ListFilter = ({ recordType, ...props }: TListFilterProps) => {
  const [barRef] = useAutoAnimate({ duration: 150 });
  const host = useListViews();
  const status = props.status ?? (recordType && host && <host.Changes recordType={recordType} />);

  return (
    <Filter id={`${props.id}-list-filter`}>
      <Filter.Bar ref={barRef} className="min-w-0 flex-nowrap justify-end">
        <Suspense>
          <ListFilterBar {...props} status={status} />
        </Suspense>
      </Filter.Bar>
    </Filter>
  );
};

/**
 * `ListFilter`'s conditions and search, as params for the list's query.
 * `filter` is core's condition group (`ConditionGroup` from `@erxes/core-contract`) as JSON,
 * its rules on the fields' paths, and `search` the search. Both are undefined when unset.
 */
export const useListFilterParams = () => {
  const { advanced, search } = useListConditions();

  return { filter: advanced ? JSON.stringify(advanced) : undefined, search: search || undefined };
};
