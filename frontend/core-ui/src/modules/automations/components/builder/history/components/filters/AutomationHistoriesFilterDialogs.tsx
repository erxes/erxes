import { AutomationHistoryActionFilterView } from '@/automations/components/builder/history/components/filters/AutomationHistoryActionFilterView';
import { AutomationHistoryErrorCodeFilterView } from '@/automations/components/builder/history/components/filters/AutomationHistoryErrorCodeFilterView';
import { Filter } from 'erxes-ui';

export const AutomationHistoriesFilterDialogs = () => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="createdAt" inDialog>
        <Filter.DialogDateView filterKey="createdAt" />
      </Filter.View>
      <AutomationHistoryActionFilterView filterKey="failedActionId" inDialog />
      <AutomationHistoryErrorCodeFilterView inDialog />
      <AutomationHistoryActionFilterView filterKey="waitingActionId" inDialog />
    </Filter.Dialog>
  );
};
