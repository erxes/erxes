import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { Button, CommandBar, RecordTable, Separator, useConfirm, useToast } from 'erxes-ui';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';

interface Props {
  onDeleteMany: (ids: string[]) => Promise<void>;
  loading: boolean;
}

const BulkDelete = ({
  rows,
  onDeleteMany,
  loading,
}: {
  rows: Row<TRemainderConfigRow>[];
  onDeleteMany: (ids: string[]) => Promise<void>;
  loading: boolean;
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleDelete = () => {
    const ids = rows.map((r) => r.original._id);
    confirm({
      message: `Are you sure you want to delete ${ids.length} selected config${ids.length === 1 ? '' : 's'}?`,
    }).then(() => {
      rows.forEach((r) => r.toggleSelected(false));
      onDeleteMany(ids).catch((e: Error) => {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      });
    });
  };

  return (
    <Button variant="secondary" className="text-destructive" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};

export const PipelineRemainderConfigCommandBar = ({ onDeleteMany, loading }: Props) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows as Row<TRemainderConfigRow>[];

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <BulkDelete rows={selectedRows} onDeleteMany={onDeleteMany} loading={loading} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
