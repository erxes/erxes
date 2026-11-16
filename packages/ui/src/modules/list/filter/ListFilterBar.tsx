import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconFilter2, IconPlus } from '@tabler/icons-react';
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import { IconTip } from '../../../components/icon-tip';
import { usePageHotkey } from '../../../hooks/use-page-hotkey';
import { ruleCount } from '../../conditions/filterRule';
import type { TListFilterProps } from '../ListFilter';
import { useFilterRowSlot } from '../ViewBar';
import { AddFilter } from './AddFilter';
import { AdvancedPopover } from './AdvancedPopover';
import { chipsOf, groupOf, partsOf, withPart } from './filterRules';
import { type AddFrom, ListFilterContext, type ListFilterState } from './listFilterContext';
import { useListConditions } from './listFilterQuery';
import { RecordCount } from './RecordCount';
import { RuleChips } from './RuleChips';
import { SearchChip } from './SearchChip';

/** The view bar's filter button: it opens the field picker and shows how many conditions apply. */
const FilterButton = ({ count }: { count: number }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const label = t('label', 'Filter');

  return (
    <IconTip label={label} hotkey="F">
      <AddFilter
        from="bar"
        trigger={
          <Button
            size="sm"
            aria-label={label}
            aria-keyshortcuts="F"
            variant={count > 0 ? 'secondary' : 'ghost'}
            tone={count > 0 ? 'default' : 'muted'}
            className="h-7 min-w-7"
          >
            <IconFilter2 className="size-4" />
            {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
          </Button>
        }
      />
    </IconTip>
  );
};

/**
 * Under the view bar while the list is filtered: the conditions as chips that wrap, "+ Filter",
 * Clear, and what the open view changed. The advanced filter opens anchored to it.
 */
const FilterRow = ({ status }: { status: ReactNode }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { clear } = useListConditions();
  const [chipsRef] = useAutoAnimate({ duration: 150 });
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rowRef}
      role="toolbar"
      aria-label={t('row', 'Filters')}
      className="flex min-h-10 shrink-0 items-start gap-2 border-b bg-background px-3 py-1.5"
    >
      <div ref={chipsRef} className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <SearchChip />
        <RuleChips />
        <AddFilter
          from="row"
          trigger={
            <Button size="sm" variant="ghost" tone="muted" className="h-7">
              <IconPlus />
              {t('label', 'Filter')}
            </Button>
          }
        />
      </div>
      <div className="flex h-7 shrink-0 items-center gap-1">
        <Button size="sm" variant="ghost" tone="muted" className="h-7" onClick={clear}>
          {t('clear', 'Clear')}
        </Button>
        {status}
      </div>
      <AdvancedPopover anchor={rowRef} />
    </div>
  );
};

/** The filter's shared state: the conditions from the address, the open pickers. */
const useListFilterState = ({
  fields,
  members,
  tags,
  totalCount,
  totalCapped,
  loading,
  error,
}: TListFilterProps): ListFilterState => {
  const { advanced, setAdvanced } = useListConditions();
  const [adding, setAdding] = useState<AddFrom | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const lookups = useMemo(() => ({ members, tags }), [members, tags]);
  const parts = useMemo(() => partsOf(advanced), [advanced]);

  return {
    fields,
    lookups,
    advanced,
    chips: chipsOf(advanced),
    parts,
    setPart: (index, next) => setAdvanced(groupOf(withPart(parts, index, next))),
    setAdvanced,
    adding,
    setAdding,
    advancedOpen,
    setAdvancedOpen,
    totalCount,
    totalCapped,
    loading,
    error,
  };
};

/**
 * In the view bar: the count, the list's own controls and the filter button (`F`). Under it,
 * while the list is filtered, the filter row: in the view bar's slot, else right after the bar.
 */
export const ListFilterBar = (props: TListFilterProps) => {
  const { status, totalCount, totalCapped, children } = props;
  const state = useListFilterState(props);
  const { advanced, search, active } = useListConditions();
  const slot = useFilterRowSlot();
  const count = (advanced ? ruleCount(advanced) : 0) + (search ? 1 : 0);
  const rowShown = active || state.advancedOpen;

  // `F` opens the picker where the conditions are: the row's "+ Filter" once it shows.
  usePageHotkey('f', () => state.setAdding(rowShown ? 'row' : 'bar'));

  const row = rowShown && <FilterRow status={status} />;

  return (
    <ListFilterContext.Provider value={state}>
      {/* A view that differs with nothing filtered (its filter cleared) still offers its reset. */}
      {!rowShown && status}
      <RecordCount totalCount={totalCount} totalCapped={totalCapped} />
      <div aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
      {children}
      <FilterButton count={count} />
      {row && (slot ? createPortal(row, slot) : row)}
    </ListFilterContext.Provider>
  );
};
