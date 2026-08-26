import { IconCurrencyDollar, IconReceipt } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TPutResponseNode = {
  _id: string;
  ebarimtId?: string | null;
  createdAt?: string | null;
  number?: string | null;
  customerName?: string | null;
  inactiveId?: string | null;
  receipts?: Array<{ id?: string | null }> | null;
};

const putResponsesSearchProvider = defineSearchProvider<TPutResponseNode>({
  key: 'mongolian-put-responses',
  label: 'eBarimt receipts',
  icon: IconReceipt,
  order: 280,
  selections: [
    {
      alias: 'gs_mongolian_put_responses',
      field: 'putResponses',
      args: 'search: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id ebarimtId: id number customerName inactiveId receipts createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TPutResponseNode>(payload, 'gs_mongolian_put_responses'),
  toItem: (putResponse) => ({
    id: putResponse._id,
    title: putResponse.number || UNNAMED,
    description: putResponse.customerName || undefined,
    createdAt: putResponse.createdAt ?? undefined,
    matchFields: [
      {
        label: 'eBarimt ID',
        labelKey: 'globalSearch.ebarimtId',
        labelNamespace: 'mongolian',
        value: putResponse.ebarimtId,
      },
      {
        label: 'Inactive ID',
        labelKey: 'globalSearch.inactiveId',
        labelNamespace: 'mongolian',
        value: putResponse.inactiveId,
      },
      ...(putResponse.receipts ?? []).map((receipt) => ({
        label: 'Receipt ID',
        labelKey: 'globalSearch.receiptId',
        labelNamespace: 'mongolian',
        value: receipt.id,
      })),
    ].flatMap(({ label, value }) => (value ? [{ label, value }] : [])),
    path: '/mongolian/put-response',
  }),
});

type TExchangeRateNode = {
  _id: string;
  createdAt?: string | null;
  mainCurrency?: string | null;
  rateCurrency?: string | null;
  rate?: number | null;
};

const exchangeRatesSearchProvider = defineSearchProvider<TExchangeRateNode>({
  key: 'mongolian-exchange-rates',
  label: 'Exchange rates',
  icon: IconCurrencyDollar,
  order: 290,
  selections: [
    {
      alias: 'gs_mongolian_exchange_rates',
      field: 'exchangeRatesMain',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id mainCurrency rateCurrency rate createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TExchangeRateNode>(payload, 'gs_mongolian_exchange_rates'),
  toItem: (rate) => ({
    id: rate._id,
    title:
      rate.mainCurrency && rate.rateCurrency
        ? `${rate.mainCurrency} / ${rate.rateCurrency}`
        : UNNAMED,
    description: typeof rate.rate === 'number' ? String(rate.rate) : undefined,
    createdAt: rate.createdAt ?? undefined,
    path: `/settings/mongolian/exchange-rates?exchange_rate_id=${rate._id}`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  putResponsesSearchProvider,
  exchangeRatesSearchProvider,
];
