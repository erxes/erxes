import { IconReceipt } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TTransactionNode = {
  _id: string;
  createdAt?: string | null;
  number?: string | null;
  parentId?: string | null;
  originId?: string | null;
  description?: string | null;
};

const transactionsSearchProvider = defineSearchProvider<TTransactionNode>({
  key: 'accounting-transactions',
  label: 'Transactions',
  icon: IconReceipt,
  order: 200,
  selections: [
    {
      alias: 'gs_accounting_transactions',
      field: 'accTransactionsMain',
      args: 'searchValue: $searchValue, limit: $limit, orderBy: $orderBy',
      body: '{ list { _id number parentId originId description createdAt } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TTransactionNode>(payload, 'gs_accounting_transactions'),
  toItem: (transaction) => ({
    id: transaction._id,
    title: transaction.number || UNNAMED,
    description: transaction.description || undefined,
    createdAt: transaction.createdAt ?? undefined,
    path: `/accounting/transaction/edit?parentId=${
      transaction.parentId ?? ''
    }&trId=${transaction.originId || transaction._id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [transactionsSearchProvider];
