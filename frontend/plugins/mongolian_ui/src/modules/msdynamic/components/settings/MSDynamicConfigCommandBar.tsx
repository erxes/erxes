import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { MSMDynamicConfigRow } from '../../types';

export const MSDynamicConfigCommandBar = () => {
  const { t } = useTranslation('mongolian');
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
          {selectedRows.length} {t('selected')}
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
  const { t } = useTranslation('mongolian');
  const { confirm } = useConfirm();

  const handleDelete = () => {
    confirm({
      message: t('delete-selected-ms-dynamics-configs'),
      options: {
        description: t('this-will-delete-selected-configs'),
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(async () => {
      try {
        await onDeleteMany(rows);
        onCompleted();
      } catch (error) {
        toast({
          title: t('error'),
          description:
            error instanceof Error
              ? error.message
              : t('failed-to-delete-selected-configs'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
