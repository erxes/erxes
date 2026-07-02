import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { Button, CommandBar, RecordTable, Separator, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface Props {
  onDeleteMany: (ids: string[]) => Promise<void>;
  loading: boolean;
}

const BulkDelete = <T extends { _id: string }>({
  rows,
  onDeleteMany,
  loading,
}: {
  rows: Row<T>[];
  onDeleteMany: (ids: string[]) => Promise<void>;
  loading: boolean;
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const handleDelete = () => {
    const ids = rows.map((r) => r.original._id);
    confirm({
      message: t('delete-configs-confirm', { count: ids.length }),
    }).then(() => {
      rows.forEach((r) => r.toggleSelected(false));
      onDeleteMany(ids).catch((e: Error) => {
        toast({ title: t('error'), description: e.message, variant: 'destructive' });
      });
    });
  };

  return (
    <Button variant="secondary" className="text-destructive" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};

export const ErkhetConfigCommandBar = <T extends { _id: string }>({ onDeleteMany, loading }: Props) => {
  const { table } = RecordTable.useRecordTable();
  const { t } = useTranslation('mongolian');
  const selectedRows = table.getFilteredSelectedRowModel().rows as Row<T>[];

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} {t('selected')}</CommandBar.Value>
        <Separator.Inline />
        <BulkDelete rows={selectedRows} onDeleteMany={onDeleteMany} loading={loading} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
