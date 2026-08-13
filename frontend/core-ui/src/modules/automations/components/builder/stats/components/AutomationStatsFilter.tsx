import { AUTOMATION_STATS_FILTER_SESSION_KEY } from '@/automations/constants';
import { AutomationsHotKeyScope } from '@/automations/types';
import { IconCalendar, IconCalendarPlus } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';

/**
 * Stats are only sliced by date — status is what the numbers explain, so
 * filtering it away would leave nothing to compare against.
 */
export const AutomationStatsFilter = () => {
  const [queries] = useMultiQueryState<{ createdAt: string }>(['createdAt']);

  return (
    <Filter
      id="automation-stats-filter"
      sessionKey={AUTOMATION_STATS_FILTER_SESSION_KEY}
    >
      <Filter.Popover scope={AutomationsHotKeyScope.HistoriesFilter}>
        <Filter.Trigger isFiltered={!!queries?.createdAt} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="createdAt">
                  <IconCalendar />
                  Filter by created
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>

      <Filter.Dialog>
        <Filter.View filterKey="createdAt" inDialog>
          <Filter.DialogDateView filterKey="createdAt" />
        </Filter.View>
      </Filter.Dialog>

      <Filter.Bar>
        <Filter.BarItem queryKey="createdAt">
          <Filter.BarName>
            <IconCalendarPlus />
            Filter by created at
          </Filter.BarName>
          <Filter.Date filterKey="createdAt" />
        </Filter.BarItem>
      </Filter.Bar>
    </Filter>
  );
};
