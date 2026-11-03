import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, Export } from 'ui-modules';
import { useTrRecordsDelete } from '@/transactions/hooks/useTrRecordsDelete';
import { useTransactionsFilterVariables } from '../hooks/useTransactionVars';
import { ITrRecord } from '../types/Transaction';

export const TransactionsCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const filterVariables = useTransactionsFilterVariables();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const transactionIds = Array.from(
    new Set(
      selectedRows
        .map((row: Row<ITrRecord>) => row.original.trId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Can action="transactionsExportManage">
          <Export
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            buttonVariant="secondary"
            ids={transactionIds}
            getFilters={() => filterVariables}
          />
          <Separator.Inline />
        </Can>
        <TransactionsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const TransactionsDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { deleteTrRecords, loading } = useTrRecordsDelete();

  const handleDelete = async () => {
    const records = table
      .getFilteredSelectedRowModel()
      .rows.map((row: Row<ITrRecord>) => row.original);

    if (await deleteTrRecords(records)) {
      table.setRowSelection({});
    }
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={handleDelete}
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
