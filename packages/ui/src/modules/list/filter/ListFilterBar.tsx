import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconAdjustmentsHorizontal, IconFilter2, IconSearch } from '@tabler/icons-react';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/button';
import { Combobox } from '../../../components/combobox';
import { Command } from '../../../components/command';
import { IconTip } from '../../../components/icon-tip';
import { Popover } from '../../../components/popover';
import { usePageHotkey } from '../../../hooks/use-page-hotkey';
import { isRule } from '../../conditions/conditions';
import { Filter } from '../../filter/components/Filter';
import { useFilterContext } from '../../filter/hooks/useFilterContext';
import type { TListFilterField, TListFilterProps } from '../ListFilter';
import { AdvancedFilterDialog } from './AdvancedFilterDialog';
import { FieldMenu } from './FieldMenus';
import { FIELD_ICONS } from './fieldIcons';
import { type FilterPart, groupOf, inMenu, partsOf, withPart } from './filterRules';
import { ListFilterContext, type ListFilterState, useListFilter } from './listFilterContext';
import { useListConditions } from './listFilterQuery';
import { RecordCount } from './RecordCount';
import { RuleChips } from './RuleChips';

/** Built-in fields first, the record's properties last; each with its heading's English. */
const GROUPS: { group: NonNullable<TListFilterField['group']>; label: string }[] = [
  { group: 'fields', label: 'Fields' },
  { group: 'lead', label: 'Lead' },
  { group: 'company', label: 'Company' },
  { group: 'activity', label: 'Activity' },
  { group: 'custom', label: 'Properties' },
];

/** Every field, grouped; each opens its submenu. The search box filters them by name. */
const FieldItems = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields } = useListFilter();

  // The built-in groups, then one per `groupLabel` (a plugin's fields under its title).
  const headings = [
    ...GROUPS.map(({ group, label }) => ({
      key: group,
      heading: t(`group.${group}`, label),
      fields: fields.filter((field) => !field.groupLabel && (field.group ?? 'fields') === group),
    })),
    ...[...new Set(fields.flatMap((field) => field.groupLabel ?? []))].map((heading) => ({
      key: `label:${heading}`,
      heading,
      fields: fields.filter((field) => field.groupLabel === heading),
    })),
  ];

  return headings.map(({ key, heading, fields: inGroup }) => {
    if (!inGroup.length) return null;

    return (
      <Command.Group key={key} heading={heading}>
        {inGroup.map((field) => {
          const Icon = field.icon ?? FIELD_ICONS[field.type];

          return (
            <Filter.Item key={field.path} value={field.path} keywords={[field.label]}>
              <Icon />
              <span className="truncate">{field.label}</span>
            </Filter.Item>
          );
        })}
      </Command.Group>
    );
  });
};

/** The menu's first page: "Add filter…", search, the advanced filter, then the fields. */
const RootMenu = ({ loading, error }: Pick<TListFilterProps, 'loading' | 'error'>) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { openAdvanced } = useListFilter();
  const search = t('search', 'Search');
  const advanced = t('advanced', 'Advanced filter');

  return (
    <Command>
      <Filter.CommandInput placeholder={t('add', 'Add filter…')} variant="secondary" focusOnMount />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('no-match', 'No field matches')}</Command.Empty>
        <Filter.Item value="searchValue" keywords={[search]} inDialog>
          <IconSearch />
          {search}
        </Filter.Item>
        <Filter.CommandItem value="advanced" keywords={[advanced]} onSelect={openAdvanced}>
          <IconAdjustmentsHorizontal />
          {advanced}
        </Filter.CommandItem>
        {loading && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('loading', 'Loading fields…')}
          </p>
        )}
        {error && (
          <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
            {error.message}
          </p>
        )}
        <FieldItems />
      </Command.List>
    </Command>
  );
};

/** The search, as a chip (it opens the search box). */
const SearchChip = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const [searchValue] = useQueryState('searchValue');

  return (
    <Filter.BarItem queryKey="searchValue">
      <Filter.BarName>
        <IconSearch />
        {t('search', 'Search')}
      </Filter.BarName>
      <Filter.BarButton filterKey="searchValue" inDialog>
        {searchValue}
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

/** Opens the filter menu; it shows how many conditions apply. */
const FilterButton = ({ count, onClick }: { count: number; onClick: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const label = t('label', 'Filter');

  return (
    <IconTip label={label} hotkey="F">
      <Popover.Trigger
        render={
          <Button
            size="sm"
            aria-label={label}
            aria-keyshortcuts="F"
            variant={count > 0 ? 'secondary' : 'ghost'}
            tone={count > 0 ? 'default' : 'muted'}
            className="h-7 min-w-7"
            onClick={onClick}
          />
        }
      >
        <IconFilter2 className="size-4" />
        {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
      </Popover.Trigger>
    </IconTip>
  );
};

/** The bar's context: the list's conditions as parts, and the one the menu is editing. */
const useListFilterState = (fields: TListFilterField[], lookups: ListFilterState['lookups']) => {
  const { advanced, setAdvanced } = useListConditions();
  const { setOpen, setView } = useFilterContext();
  const [editing, setEditing] = useState<number | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const parts = useMemo(() => partsOf(advanced), [advanced]);

  const openMenu = useCallback(
    (view: string, part: number | null) => {
      setEditing(part);
      setView(view);
      setOpen(true);
    },
    [setOpen, setView],
  );

  usePageHotkey('f', () => openMenu('root', null));

  const state = useMemo<ListFilterState>(
    () => ({
      fields,
      lookups,
      parts,
      editing,
      setPart: (index: number | null, next: FilterPart | null) =>
        setAdvanced(groupOf(withPart(parts, index, next))),
      edit: (index: number) => {
        const part = parts[index];
        const field = part && isRule(part) && fields.find((one) => one.path === part.path);

        if (part && isRule(part) && field && inMenu(part, field)) openMenu(field.path, index);
        else setAdvancedOpen(true);
      },
      openAdvanced: () => setAdvancedOpen(true),
    }),
    [fields, lookups, parts, editing, setAdvanced, openMenu],
  );

  return { state, setEditing, advancedOpen, setAdvancedOpen };
};

/**
 * Inside `<Filter>`: its chips, the list's status and the count, then the list's controls
 * and the menu (`F`).
 */
export const ListFilterBar = ({
  id,
  fields,
  loading,
  error,
  status,
  totalCount,
  totalCapped,
  children,
  members,
  tags,
}: TListFilterProps) => {
  const [chipsRef] = useAutoAnimate({ duration: 150 });
  const { search } = useListConditions();
  const lookups = useMemo(() => ({ members, tags }), [members, tags]);

  const { state, setEditing, advancedOpen, setAdvancedOpen } = useListFilterState(fields, lookups);

  return (
    <ListFilterContext.Provider value={state}>
      <div
        ref={chipsRef}
        className="flex min-w-0 items-center gap-1 overflow-x-auto py-1 hide-scroll"
      >
        <SearchChip />
        <RuleChips />
      </div>
      {status}
      <RecordCount totalCount={totalCount} totalCapped={totalCapped} />
      <div aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
      {children}
      <Filter.Popover scope={`${id}-list`}>
        <FilterButton
          count={state.parts.length + (search ? 1 : 0)}
          onClick={() => setEditing(null)}
        />
        <Combobox.Content align="end" className="w-80">
          <Filter.View>
            <RootMenu loading={loading} error={error} />
          </Filter.View>
          {fields.map((field) => (
            <Filter.View key={field.path} filterKey={field.path}>
              <FieldMenu key={`${state.editing}`} field={field} />
            </Filter.View>
          ))}
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
      <AdvancedFilterDialog open={advancedOpen} onOpenChange={setAdvancedOpen} />
    </ListFilterContext.Provider>
  );
};
