import {
  IconBroadcast,
  IconCheck,
  IconProgress,
  IconSearch,
  IconSettings,
  IconSettingsSpark,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBrand, SelectMember } from 'ui-modules';
import { BroadcastMessageMethod } from './select/BroadcastSelectMessageMethod';
import { BroadcastMessageStatus } from './select/BroadcastSelectMessageStatus';

const BroadcastFilterPopover = () => {
  const { t } = useTranslation('broadcasts');
  const [queries, setQueries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    kind: string;
  }>(['searchValue', 'status', 'kind']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter', 'Filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.CommandItem
                  onSelect={() => setQueries({ kind: 'auto' })}
                >
                  <IconSettingsSpark />
                  {t('auto', 'Auto')}
                  {queries.kind === 'auto' && <IconCheck className="ml-auto" />}
                </Filter.CommandItem>
                <Filter.CommandItem
                  onSelect={() => setQueries({ kind: 'manual' })}
                >
                  <IconSettings />
                  {t('manual', 'Manual')}
                  {queries.kind === 'manual' && (
                    <IconCheck className="ml-auto" />
                  )}
                </Filter.CommandItem>
                <Command.Separator className="my-1" />

                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search', 'Search')}
                </Filter.Item>
                <Filter.Item value="status">
                  <IconProgress />
                  {t('status', 'Status')}
                </Filter.Item>
                <Filter.Item value="methods">
                  <IconBroadcast />
                  {t('method', 'Method')}
                </Filter.Item>

                <SelectBrand.FilterItem />
                <SelectMember.FilterItem value="fromUser" label={t('from', 'From')} />
              </Command.List>
            </Command>
          </Filter.View>

          <BroadcastMessageStatus.FilterView />
          <BroadcastMessageMethod.FilterView />

          <SelectBrand.FilterView />
          <SelectMember.FilterView queryKey="fromUser" />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const BroadcastFilter = () => {
  const { t } = useTranslation('broadcasts');
  const [queries, setQueries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    kind: string;
  }>(['searchValue', 'status', 'kind']);

  return (
    <Filter id="broadcast-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="kind">
          <Filter.BarName>
            {queries?.kind === 'auto' ? (
              <IconSettingsSpark />
            ) : (
              <IconSettings />
            )}
          </Filter.BarName>
          <Filter.BarButton
            onClick={() =>
              setQueries({ kind: queries?.kind === 'auto' ? 'manual' : 'auto' })
            }
          >
            {queries?.kind === 'auto' ? t('auto', 'Auto') : t('manual', 'Manual')}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search', 'Search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {queries.searchValue || ''}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgress />
            {t('status', 'Status')}
          </Filter.BarName>
          <BroadcastMessageStatus.FilterBar />
        </Filter.BarItem>

        <Filter.BarItem queryKey="methods">
          <Filter.BarName>
            <IconBroadcast />
            {t('method', 'Method')}
          </Filter.BarName>
          <BroadcastMessageMethod.FilterBar />
        </Filter.BarItem>

        <SelectBrand.FilterBar />
        <SelectMember.FilterBar queryKey="fromUser" label={t('from', 'From')} />

        <BroadcastFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};
