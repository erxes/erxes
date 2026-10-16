import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';

export const KbSelectionCommandBar = ({
  confirmMessage,
  removedMessage,
  remove,
  loading,
  actions,
}: {
  confirmMessage: (count: number) => string;
  removedMessage: string;
  remove: (ids: string[]) => Promise<unknown>;
  loading: boolean;
  actions?: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const confirmRemove = useKbConfirmRemove();

  const ids = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => (row.original as { _id: string })._id);

  const handleDelete = () =>
    confirmRemove({
      message: confirmMessage(ids.length),
      removedMessage,
      remove: () => remove(ids),
      onRemoved: () => table.setRowSelection({}),
    });

  return (
    <CommandBar open={ids.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: ids.length })}
        </CommandBar.Value>
        <Separator.Inline />
        {actions}
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
