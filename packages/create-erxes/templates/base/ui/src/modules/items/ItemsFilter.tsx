import { memberQueries } from '@erxes/core-contract/client';
import { IconFilter2, IconSearch, IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Combobox,
  Command,
  EntityPicker,
  Filter,
  MemberInline,
  memberName,
  Popover,
  useFilterContext,
} from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';

/** The list's filters, read from the address, so links and reloads keep them. */
export const useItemsFilter = () => {
  const [searchValue] = useQueryState('searchValue');
  const [createdBy] = useQueryState('createdBy');

  return { search: searchValue ?? undefined, createdBy: createdBy ?? undefined };
};

/** The "Created by" menu: active members; a pick applies and closes the menu. */
const CreatedByMenu = () => {
  const { resetFilterState } = useFilterContext();
  const [createdBy, setCreatedBy] = useQueryState('createdBy');
  const team = useQuery(memberQueries.team);

  return (
    <EntityPicker
      items={team.data?.data ?? []}
      itemKey={(member) => ({ id: member.id, label: `${memberName(member)} ${member.email}` })}
      renderItem={(member) => <MemberInline memberId={member.id} members={memberQueries} />}
      value={createdBy ? [createdBy] : []}
      onValueChange={([id]) => {
        void setCreatedBy(id ?? null);
        resetFilterState();
      }}
      loading={team.isPending}
      error={team.error}
    />
  );
};

/** An applied "Created by" as a chip: its member reopens the menu, ✕ clears it. */
const CreatedByChip = () => {
  const { t } = useTranslation('__id__');
  const { setOpen, setView } = useFilterContext();
  const { createdBy } = useItemsFilter();

  return (
    <Filter.BarItem queryKey="createdBy">
      <Filter.BarName>
        <IconUser />
        {t('created-by', 'Created by')}
      </Filter.BarName>
      <Filter.BarButton
        onClick={() => {
          setView('createdBy');
          setOpen(true);
        }}
      >
        <MemberInline memberId={createdBy} members={memberQueries} />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

/**
 * The list's filter bar, as core's lists show it: each applied filter is a
 * chip, then the filter button, whose menu offers search and every field.
 */
export const ItemsFilter = () => {
  const { t } = useTranslation('__id__');
  const { search, createdBy } = useItemsFilter();
  const applied = (search ? 1 : 0) + (createdBy ? 1 : 0);

  return (
    <Filter id="__id__-items-filter">
      <Filter.Bar className="min-w-0 flex-nowrap justify-end">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1">
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              {t('search', 'Search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {search}
            </Filter.BarButton>
          </Filter.BarItem>
          <CreatedByChip />
        </div>
        <Filter.Popover scope="__id__-items">
          <Popover.Trigger
            render={
              <Button
                size="sm"
                aria-label={t('filter', 'Filter')}
                variant={applied ? 'secondary' : 'ghost'}
              />
            }
          >
            <IconFilter2 />
            {applied > 0 && <span className="text-xs tabular-nums">{applied}</span>}
          </Popover.Trigger>
          <Combobox.Content align="end" className="w-72">
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder={t('filter-by', 'Filter by…')} focusOnMount />
                <Command.List>
                  <Filter.Item value="searchValue" inDialog>
                    <IconSearch />
                    {t('search', 'Search')}
                  </Filter.Item>
                  <Filter.Item value="createdBy">
                    <IconUser />
                    {t('created-by', 'Created by')}
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <Filter.View filterKey="createdBy">
              <CreatedByMenu />
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
      </Filter.Bar>
    </Filter>
  );
};
