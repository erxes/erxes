import { AutomationHistoriesFilterBar } from '@/automations/components/builder/history/components/filters/AutomationHistoriesFilterBar';
import { AutomationHistoriesFilterDialogs } from '@/automations/components/builder/history/components/filters/AutomationHistoriesFilterDialogs';
import { AutomationHistoriesFilterMenu } from '@/automations/components/builder/history/components/filters/AutomationHistoriesFilterMenu';
import { AutomationHistoriesFilterViews } from '@/automations/components/builder/history/components/filters/AutomationHistoriesFilterViews';
import { AUTOMATION_HISTORIES_CURSOR_SESSION_KEY } from '@/automations/constants';
import { AutomationsHotKeyScope, StatusBadgeValue } from '@/automations/types';
import { Combobox, Filter, useMultiQueryState } from 'erxes-ui';

export const AutomationHistoriesRecordTableFilter = () => {
  const [queries] = useMultiQueryState<{
    status?: StatusBadgeValue;
    createdAt: string;
  }>(['status', 'createdAt']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter
      id="automation-histories-filter"
      sessionKey={AUTOMATION_HISTORIES_CURSOR_SESSION_KEY}
    >
      <Filter.Popover scope={AutomationsHotKeyScope.HistoriesFilter}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <AutomationHistoriesFilterMenu />
          <AutomationHistoriesFilterViews />
        </Combobox.Content>
      </Filter.Popover>
      <AutomationHistoriesFilterDialogs />
      <AutomationHistoriesFilterBar />
    </Filter>
  );
};
