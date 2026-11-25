import { IconUser } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ITransaction } from '../types/Transaction';

export const getTransactionContactName = ({
  customer,
}: Pick<ITransaction, 'customer'>) =>
  [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim() ||
  customer?.code ||
  '-';

export const transactionContactColumn = <T,>(
  t: TFunction<'accounting'>,
  renderContact: (transaction: T) => ReactNode,
): ColumnDef<T> => ({
  id: 'customerId',
  accessorKey: 'customerId',
  header: () => <RecordTable.InlineHead icon={IconUser} label={t('contact')} />,
  cell: ({ row: { original } }) => (
    <RecordTableInlineCell>{renderContact(original)}</RecordTableInlineCell>
  ),
  size: 200,
});

export const TransactionContactColumnOrder = ({
  creditColumnId,
}: {
  creditColumnId: string;
}) => {
  const { table } = RecordTable.useRecordTable();

  useEffect(() => {
    table.setColumnOrder((order) => {
      const credit = order.indexOf(creditColumnId);
      const location = Math.min(
        order.indexOf('branch'),
        order.indexOf('department'),
      );
      const contact = order.indexOf('customerId');

      if (
        credit < 0 ||
        location < credit ||
        (credit < contact && contact < location)
      ) {
        return order;
      }

      const updated = order.filter((column) => column !== 'customerId');
      updated.splice(updated.indexOf(creditColumnId) + 1, 0, 'customerId');
      return updated;
    });
  }, [creditColumnId, table]);

  return null;
};
