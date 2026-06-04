import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useRemoveExchangeRates } from '../hooks/useRemoveExchangeRates';

export const ExchangeRatesCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedCount} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ExchangeRatesDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const ExchangeRatesDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { remove, loading } = useRemoveExchangeRates();

  const handleDelete = () => {
    const rateIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id)
      .filter((id): id is string => Boolean(id));

    remove(rateIds, () => table.setRowSelection({}));
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
