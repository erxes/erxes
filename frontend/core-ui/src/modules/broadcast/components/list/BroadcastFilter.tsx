import {
  IconBroadcast,
  IconCheck,
  IconProgress,
  IconSearch,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastEmailScope } from '../../hooks/useBroadcastEmailScope';
import {
  BROADCAST_TRIGGERS,
  nextTrigger,
  triggerIcon,
  triggerLabelKey,
} from '../../utils/broadcastTrigger';
import { SelectBrand, SelectMember } from 'ui-modules';
import { BroadcastMessageMethod } from '../common/select/BroadcastSelectMessageMethod';
import { BroadcastMessageStatus } from '../common/select/BroadcastSelectMessageStatus';
import { BroadcastTotalCount } from './BroadcastTotalCount';
import { BroadcastDisplayControl } from './BroadcastDisplayControl';

const BroadcastFilterPopover = () => {
  const { t } = useTranslation('broadcasts');
  const isEmailScope = useBroadcastEmailScope();
  const [queries, setQueries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    trigger: string;
  }>(['searchValue', 'status', 'trigger']);

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
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                {BROADCAST_TRIGGERS.map(({ value, labelKey, Icon }) => (
                  <Filter.CommandItem
                    key={value}
                    onSelect={() => setQueries({ trigger: value })}
                  >
                    <Icon />
                    {t(labelKey)}
                    {queries.trigger === value && (
                      <IconCheck className="ml-auto" />
                    )}
                  </Filter.CommandItem>
                ))}
                <Command.Separator className="my-1" />

                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Filter.Item value="status">
                  <IconProgress />
                  Status
                </Filter.Item>
                <Filter.Item value="methods">
                  <IconBroadcast />
                  Method
                </Filter.Item>

                {isEmailScope && (
                  <>
                    <SelectBrand.FilterItem />
                    <SelectMember.FilterItem value="fromUser" label="From" />
                  </>
                )}
              </Command.List>
            </Command>
          </Filter.View>

          <BroadcastMessageStatus.FilterView />
          <BroadcastMessageMethod.FilterView />

          {isEmailScope && (
            <>
              <SelectBrand.FilterView />
              <SelectMember.FilterView queryKey="fromUser" />
            </>
          )}
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
  const isEmailScope = useBroadcastEmailScope();
  const [queries, setQueries] = useMultiQueryState<{
    searchValue: string;
    status: string;
    trigger: string;
  }>(['searchValue', 'status', 'trigger']);

  return (
    <Filter id="broadcast-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="trigger">
          <Filter.BarName>
            {(() => {
              const Icon = triggerIcon(queries?.trigger);

              return <Icon />;
            })()}
          </Filter.BarName>
          <Filter.BarButton
            // Steps through the three, since there is nowhere else to pick
            // from once the filter is already on the bar.
            onClick={() =>
              setQueries({ trigger: nextTrigger(queries?.trigger) })
            }
          >
            {t(triggerLabelKey(queries?.trigger))}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Search
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {queries.searchValue || ''}
          </Filter.BarButton>
        </Filter.BarItem>

        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgress />
            Status
          </Filter.BarName>
          <BroadcastMessageStatus.FilterBar />
        </Filter.BarItem>

        <Filter.BarItem queryKey="methods">
          <Filter.BarName>
            <IconBroadcast />
            Method
          </Filter.BarName>
          <BroadcastMessageMethod.FilterBar />
        </Filter.BarItem>

        {isEmailScope && (
          <>
            <SelectBrand.FilterBar />
            <SelectMember.FilterBar queryKey="fromUser" label="From" />
          </>
        )}

        <BroadcastFilterPopover />

        <BroadcastTotalCount />

        <div className="ml-auto">
          <BroadcastDisplayControl />
        </div>
      </Filter.Bar>
    </Filter>
  );
};
