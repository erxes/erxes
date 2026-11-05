import {
  IconArrowBackUp,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ExecutionActionRecord } from './executionActions';
import { useExecutionActions } from './useExecutionActions';

export const ExecutionCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const selected: ExecutionActionRecord[] = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const { canRun, run, loading } = useExecutionActions();
  const clearCompletedSelection = (ids: string[]) => {
    table.setRowSelection((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([id]) => !ids.includes(id)),
      ),
    );
  };
  const actions = [
    { action: 'post', label: 'production-post', Icon: IconPlayerPlay },
    { action: 'undo', label: 'production-undo', Icon: IconArrowBackUp },
    { action: 'remove', label: 'delete', Icon: IconTrash },
  ] as const;
  return (
    <CommandBar open={selected.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value
          onClose={() => {
            if (!loading) table.setRowSelection({});
          }}
        >
          {selected.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        {actions.map(({ action, label, Icon }) => (
          <Button
            key={action}
            variant="secondary"
            disabled={loading || !canRun(action, selected)}
            onClick={() => void run(action, selected, clearCompletedSelection)}
          >
            {loading ? <Spinner /> : <Icon />}
            {t(label)}
          </Button>
        ))}
      </CommandBar.Bar>
    </CommandBar>
  );
};
