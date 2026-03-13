import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
  useToast,
} from 'erxes-ui';
import { useAppsRemove } from '../hooks/useAppsRemove';

export const AppsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { appsRemove } = useAppsRemove();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: `Are you sure you want to remove the selected (${ids.length})?`,
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await Promise.all(
          ids.map((_id) =>
            appsRemove({
              variables: { _id },
              onError: (error) => {
                toast({
                  title: 'Error',
                  description: error.message,
                  variant: 'destructive',
                });
              },
            }),
          ),
        );
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={onRemove}>
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
