import type { ViewRecordType } from '@erxes/core-contract';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { IconAdjustmentsHorizontal, IconFilter2, IconSearch } from '@tabler/icons-react';
import { Button, Combobox, Command, Filter, Popover, useFilterContext } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { messageOf } from '@erxes/core-contract/client';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { isRule } from '~/modules/automations/builder/conditionOperators';
import { type ListField, useFilterFields, useListQuery } from '../useViews';
import { ViewChanges } from '../ViewControls';
import { AdvancedFilterDialog } from './AdvancedFilterDialog';
import { FieldMenu } from './FieldMenus';
import { FIELD_ICONS } from './fieldIcons';
import { type FilterPart, groupOf, inMenu, partsOf, withPart } from './filterRules';
import { ListFilterContext, type ListFilterState, useListFilter } from './listFilterContext';
import { RecordCount, type Total } from './RecordCount';
import { RuleChips } from './RuleChips';

/** Built-in fields first, the record's properties last. */
const GROUPS: ListField['group'][] = ['fields', 'lead', 'company', 'activity', 'custom'];

/** Every field, grouped; each opens its submenu. The search box filters them by name. */
const FieldItems = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields } = useListFilter();

  return GROUPS.map((group) => {
    const inGroup = fields.filter((field) => field.group === group);

    if (!inGroup.length) return null;

    return (
      <Command.Group key={group} heading={t(`group.${group}`)}>
        {inGroup.map((field) => {
          const Icon = FIELD_ICONS[field.type];

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
const RootMenu = ({ loading, error }: { loading: boolean; error: Error | null }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { openAdvanced } = useListFilter();

  return (
    <Command>
      <Filter.CommandInput placeholder={t('add')} variant="secondary" focusOnMount />
      <Command.List className="max-h-popup">
        <Command.Empty>{t('no-match')}</Command.Empty>
        <Filter.Item value="searchValue" keywords={[t('search')]} inDialog>
          <IconSearch />
          {t('search')}
        </Filter.Item>
        <Filter.CommandItem value="advanced" keywords={[t('advanced')]} onSelect={openAdvanced}>
          <IconAdjustmentsHorizontal />
          {t('advanced')}
        </Filter.CommandItem>
        {loading && <p className="px-2 py-1.5 text-xs text-muted-foreground">{t('loading')}</p>}
        {error && (
          <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
            {messageOf(error)}
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
        {t('search')}
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

  return (
    <IconTip label={t('label')} hotkey="F">
      <Popover.Trigger
        render={
          <Button
            size="sm"
            aria-label={t('label')}
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

interface ListFilterProps extends Total {
  recordType: ViewRecordType;
  optionLabel?: ListFilterState['optionLabel'];
  /** The list's own icon controls (Archived, Display), just before the menu. */
  children?: ReactNode;
}

/**
 * Inside `<Filter>`: its chips, the view's changes and the count, then the
 * list's controls and the menu (`F`).
 */
const ListFilterBar = ({
  recordType,
  optionLabel,
  totalCount,
  totalCapped,
  children,
}: ListFilterProps) => {
  const [chipsRef] = useAutoAnimate({ duration: 150 });
  const fieldsQuery = useFilterFields(recordType);
  const fields = fieldsQuery.data ?? [];
  const { advanced, setAdvanced, search } = useListQuery();
  const { setOpen, setView } = useFilterContext();
  const [editing, setEditing] = useState<number | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const parts = partsOf(advanced);

  const openMenu = (view: string, part: number | null) => {
    setEditing(part);
    setView(view);
    setOpen(true);
  };

  usePageHotkey('f', () => openMenu('root', null));

  const state: ListFilterState = {
    recordType,
    fields,
    parts,
    optionLabel,
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
  };

  return (
    <ListFilterContext.Provider value={state}>
      <div
        ref={chipsRef}
        className="flex min-w-0 items-center gap-1 overflow-x-auto py-1 hide-scroll"
      >
        <SearchChip />
        <RuleChips />
      </div>
      <ViewChanges recordType={recordType} />
      <RecordCount totalCount={totalCount} totalCapped={totalCapped} />
      <div aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
      {children}
      <Filter.Popover scope={`${recordType}-list`}>
        <FilterButton count={parts.length + (search ? 1 : 0)} onClick={() => setEditing(null)} />
        <Combobox.Content align="end" className="w-80">
          <Filter.View>
            <RootMenu loading={fieldsQuery.isLoading} error={fieldsQuery.error} />
          </Filter.View>
          {fields.map((field) => (
            <Filter.View key={field.path} filterKey={field.path}>
              <FieldMenu key={`${editing}`} field={field} />
            </Filter.View>
          ))}
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
      <AdvancedFilterDialog
        recordType={recordType}
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
      />
    </ListFilterContext.Provider>
  );
};

/**
 * A list's filter bar: the menu of every field `views.fields` gives (`F`),
 * search, the advanced filter, and each condition as a chip. Conditions are
 * the list's filter (`useListQuery().advanced`), which views save.
 */
export const ListFilter = (props: ListFilterProps) => {
  const [barRef] = useAutoAnimate({ duration: 150 });

  return (
    <Filter id={`${props.recordType}-list-filter`}>
      <Filter.Bar ref={barRef} className="min-w-0 flex-nowrap justify-end">
        <ListFilterBar {...props} />
      </Filter.Bar>
    </Filter>
  );
};
