import type { ITransaction } from '@/transactions/types/Transaction';

export const getTransactionNumbers = (
  transactions: Pick<ITransaction, '_id' | 'number' | 'ptrNumber'>[],
) =>
  new Map(
    transactions.flatMap((transaction) =>
      transaction._id
        ? [[transaction._id, transaction.number || transaction.ptrNumber || '']]
        : [],
    ),
  );
