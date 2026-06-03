import { useMutation } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { mutations } from '../graphql';
import { EXCHANGE_RATES_QUERY_NAME } from '../constants';
import { notifyError, notifySuccess } from '../utils';

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
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);

  const [removeExchangeRates] = useMutation(mutations.exchangeRatesRemove, {
    refetchQueries: [EXCHANGE_RATES_QUERY_NAME],
  });

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete the selected exchange rates?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(async () => {
      const rateIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);
      setLoading(true);
      try {
        await removeExchangeRates({ variables: { rateIds } });
        table.setRowSelection({});
        notifySuccess('Exchange rates deleted');
      } catch (e) {
        notifyError(e);
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
