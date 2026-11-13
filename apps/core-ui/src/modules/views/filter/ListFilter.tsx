import type { ViewRecordType } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useFilterContext, useFilterQueryState } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { isRule } from '~/modules/automations/builder/conditionOperators';
import { type ListField, useFilterFields, useListQuery } from '../useViews';
import { AdvancedFilterDialog } from './AdvancedFilterDialog';
import { FieldMenu } from './FieldMenus';
import { FIELD_ICONS } from './fieldIcons';
import { type FilterPart, groupOf, inMenu, partsOf, withPart } from './filterRules';
import { ListFilterContext, type ListFilterState, useListFilter } from './listFilterContext';
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
      <Filter.CommandInput
        placeholder={t('add')}
        variant="secondary"
        className="bg-background"
        focusOnMount
      />
      <Command.List className="max-h-[min(26rem,60vh)] p-1">
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
  const [searchValue] = useFilterQueryState<string>('searchValue');

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

/** Inside `<Filter>`: the menu (opened with `F`), its chips and the advanced filter. */
const ListFilterBar = ({
  recordType,
  optionLabel,
  children,
}: {
  recordType: ViewRecordType;
  optionLabel?: ListFilterState['optionLabel'];
  children?: ReactNode;
}) => {
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
      <Filter.Popover scope={`${recordType}-list`}>
        <Filter.Trigger
          isFiltered={parts.length > 0 || Boolean(search)}
          onClick={() => setEditing(null)}
        />
        <Combobox.Content className="w-80">
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
      <SearchChip />
      <RuleChips />
      {children}
    </ListFilterContext.Provider>
  );
};

/**
 * A list's filter bar: the menu of every field `views.fields` gives (`F`),
 * search, the advanced filter, and each condition as a chip. Conditions are
 * the list's filter (`useListQuery().advanced`), which views save.
 * `children` follow the chips (toggles, the count).
 */
export const ListFilter = ({
  recordType,
  sessionKey,
  optionLabel,
  children,
}: {
  recordType: ViewRecordType;
  sessionKey: string;
  optionLabel?: ListFilterState['optionLabel'];
  children?: ReactNode;
}) => (
  <Filter id={`${recordType}-list-filter`} sessionKey={sessionKey}>
    <Filter.Bar>
      <ListFilterBar recordType={recordType} optionLabel={optionLabel}>
        {children}
      </ListFilterBar>
    </Filter.Bar>
  </Filter>
);
