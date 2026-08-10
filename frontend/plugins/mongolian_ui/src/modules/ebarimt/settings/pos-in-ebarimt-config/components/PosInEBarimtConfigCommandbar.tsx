import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemovePosInEbarimtConfigs } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useRemovePosInEbarimtConfigs';
import { useTranslation } from 'react-i18next';

export const PosInEBarimtConfigCommandbar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <PosInEBarimtConfigDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const PosInEBarimtConfigDelete = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeConfigs, loading } = useRemovePosInEbarimtConfigs();

  const handleDelete = () => {
    confirm({
      message: t('delete-pos-in-ebarimt-config-confirm'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeConfigs(ids)
        .then(() => {
          table.setRowSelection({});
          toast({
            title: t('success'),
            description: t('configs-deleted-successfully'),
          });
        })
        .catch((error: Error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
