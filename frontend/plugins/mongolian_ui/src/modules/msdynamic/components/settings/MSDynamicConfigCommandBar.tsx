import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { MSMDynamicConfigRow } from '../../types';

export const MSDynamicConfigCommandBar = () => {
  const { configsMap, loading: configsLoading, saveConfigs, saveLoading } =
    useMSDynamicConfigs();
  const { loading, removeConfigs } = useMSDynamicConfigActions({
    configsMap,
    saveConfigs,
  });
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const isLoading = configsLoading || loading || saveLoading;

  const clearSelection = () => table.setRowSelection({});

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={clearSelection}>
          {selectedRows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <MSDynamicConfigBulkDelete
          rows={selectedRows.map((row) => row.original)}
          loading={isLoading}
          onDeleteMany={removeConfigs}
          onCompleted={clearSelection}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const MSDynamicConfigBulkDelete = ({
  rows,
  loading,
  onDeleteMany,
  onCompleted,
}: {
  rows: MSMDynamicConfigRow[];
  loading: boolean;
  onDeleteMany: (rows: MSMDynamicConfigRow[]) => Promise<void>;
  onCompleted: () => void;
}) => {
  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({
      message: 'Delete selected MS Dynamics configs?',
      options: {
        description: 'This will delete the selected configs.',
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(async () => {
      try {
        await onDeleteMany(rows);
        onCompleted();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete selected configs',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
