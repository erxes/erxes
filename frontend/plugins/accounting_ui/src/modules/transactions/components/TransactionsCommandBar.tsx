import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, Export } from 'ui-modules';
import { useTrRecordsRemove } from '../hooks/useTrRecordsRemove';
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
  const { confirm } = useConfirm();
  const { removeTrRecords, loading } = useTrRecordsRemove();

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-tr-records'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      // Delete each transaction record by parentId
      selectedRows.forEach((row) => {
        if (row.original.parentId) {
          removeTrRecords(row.original.parentId);
        }
      });

      // Clear selection after deletion
      table.setRowSelection({});
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
