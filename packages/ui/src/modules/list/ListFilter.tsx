import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconFilterOff } from '@tabler/icons-react';
import { type ElementType, lazy, type ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { Empty } from '../../components/empty';
import type { TConditionLookups } from '../conditions/conditions';
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
   * `options`, a team member (from `members`), a tag (from `tags`), a customer or company
   * (searched in `contacts`). The rule's value is the picked ids.
   */
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'boolean'
    | 'select'
    | 'member'
    | 'tags'
    | 'customer'
    | 'company';
  /** A `select`'s choices. */
  options?: { value: string; label: string }[];
  /** Instead of the type's icon. */
  icon?: ElementType;
  /** The menu's heading it lists under; `fields` by default. `plugin`: under `groupLabel`. */
  group?: 'fields' | 'lead' | 'company' | 'activity' | 'custom' | 'plugin';
  /** The heading instead of the group's own: a plugin's title, for the fields it keeps. */
  groupLabel?: string;
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
 * A list's filter: a view bar button, and a chip row while it filters.
 * The field picker opens on `F` and holds search and the advanced filter, a popover of
 * "Where / And / Or" rows. Each chip is one condition whose field, operator and value open in
 * place. The conditions and search live in the address (shared links and reloads keep them);
 * `useListFilterParams()` reads them for the list's query. `member` fields pick
 * from `members`, `tags` fields from `tags`, `customer` and `company` fields from `contacts`: in
 * erxes `memberQueries` and `contactSearchQueries` from `@erxes/core-contract/client` and the
 * tags query of the record type; outside erxes, the plugin's own.
 */
export const ListFilter = ({ recordType, ...props }: TListFilterProps) => {
  const [barRef] = useAutoAnimate({ duration: 150 });
  const host = useListViews();
  const status = props.status ?? (recordType && host && <host.Changes recordType={recordType} />);

  return (
    <div ref={barRef} className="flex min-w-0 flex-1 items-center justify-end gap-1">
      <Suspense>
        <ListFilterBar {...props} status={status} />
      </Suspense>
    </div>
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

/**
 * A list's empty state while `ListFilter` filters it, with Clear filters.
 * "No customers match these filters" and a button that clears them; `fallback`, the list's own
 * empty state, when it isn't filtered.
 * `records` names them ("customers"); "records" by default.
 */
export const ListFilterEmpty = ({
  records,
  fallback = null,
}: {
  records?: string;
  fallback?: ReactNode;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { active, clear } = useListConditions();

  if (!active) return fallback;

  return (
    <Empty className="pointer-events-none absolute inset-x-0 top-2/5">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconFilterOff />
        </Empty.Media>
        <Empty.Title>
          {t('no-records', {
            records: records ?? t('records', 'records'),
            defaultValue: 'No {{records}} match these filters',
          })}
        </Empty.Title>
        <Empty.Description>
          {t('no-records-hint', 'Change a condition or clear them to see every record.')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content className="pointer-events-auto">
        <Button variant="outline" onClick={clear}>
          {t('clear-filters', 'Clear filters')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};
