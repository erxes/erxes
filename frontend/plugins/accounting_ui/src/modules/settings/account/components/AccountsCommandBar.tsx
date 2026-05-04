import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useAccountsRemove } from '../hooks/useAccountsRemove';

export const AccountsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} сонгосон
        </CommandBar.Value>
        <Separator.Inline />
        <AccountsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const AccountsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeAccounts, loading } = useAccountsRemove();

  const handleDelete = () =>
    confirm({
      message: 'Эдгээр дансыг устгахдаа итгэлтэй байна уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      removeAccounts({
        variables: {
          accountIds: table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id),
        },
        onCompleted: () => {
          table.setRowSelection({});
        },
      });
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Устгах
    </Button>
  );
};
