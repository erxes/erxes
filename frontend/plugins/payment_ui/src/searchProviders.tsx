import { IconInvoice } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TInvoiceNode = {
  _id: string;
  invoiceNumber?: string | null;
  amount?: number | null;
};

const invoicesSearchProvider = defineSearchProvider<TInvoiceNode>({
  key: 'payment-invoices',
  label: 'Invoices',
  icon: IconInvoice,
  order: 250,
  selections: [
    {
      alias: 'gs_payment_invoices',
      field: 'invoices',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id invoiceNumber amount } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TInvoiceNode>(payload, 'gs_payment_invoices'),
  toItem: (invoice) => ({
    id: invoice._id,
    title: invoice.invoiceNumber || UNNAMED,
    description:
      typeof invoice.amount === 'number' ? String(invoice.amount) : undefined,
    path: '/settings/payment/invoices',
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [invoicesSearchProvider];
