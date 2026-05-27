import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { useState } from 'react';

export const ReturnEBarimtConfigCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ReturnEBarimtConfigDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const ReturnEBarimtConfigDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'returnStageInEbarimt' } }],
  });

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete selected configs?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(async () => {
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);
      setLoading(true);
      try {
        await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
        table.setRowSelection({});
        toast({ title: 'Success', description: 'Configurations deleted successfully' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
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
