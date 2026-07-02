import { Button, CommandBar, RecordTable, Separator, toast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { useState } from 'react';

export const StageInEBarimtConfigCommandbar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <StageInEBarimtConfigDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const StageInEBarimtConfigDelete = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'stageInEbarimt' } }],
  });

  const handleDelete = () => {
    confirm({
      message: t('delete-pos-in-ebarimt-config-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(async () => {
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);
      setLoading(true);
      try {
        await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
        table.setRowSelection({});
        toast({ title: t('success'), description: t('configs-deleted-successfully') });
      } catch (error: any) {
        toast({ title: t('error'), description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
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
