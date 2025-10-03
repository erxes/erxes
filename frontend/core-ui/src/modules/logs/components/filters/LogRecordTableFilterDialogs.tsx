import { Filter } from 'erxes-ui';

export const LogRecordTableFilterDialogs = () => {
  return (
    <Filter.Dialog>
      <Filter.View filterKey="createdAt" inDialog>
        <Filter.DialogDateView filterKey="createdAt" />
      </Filter.View>
    </Filter.Dialog>
  );
};
