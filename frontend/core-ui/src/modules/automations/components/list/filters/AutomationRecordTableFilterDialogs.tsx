import { Filter } from 'erxes-ui';

export const AutomationRecordTableFilterDialogs = () => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="createdAt" inDialog>
        <Filter.DialogDateView filterKey="createdAt" />
      </Filter.View>
      <Filter.View filterKey="updatedAt" inDialog>
        <Filter.DialogDateView filterKey="updatedAt" />
      </Filter.View>
    </Filter.Dialog>
  );
};
