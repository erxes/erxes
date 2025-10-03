import { Filter } from 'erxes-ui';

export const AutomationHistoriesFilterDialogs = () => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="createdAt" inDialog>
        <Filter.DialogDateView filterKey="createdAt" />
      </Filter.View>
    </Filter.Dialog>
  );
};
