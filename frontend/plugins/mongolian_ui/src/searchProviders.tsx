import { IconCurrencyDollar, IconReceipt } from '@tabler/icons-react';
import { defineSearchProvider, ISearchProvider, readCursorList } from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TPutResponseNode = {
  _id: string;
  number?: string | null;
  customerName?: string | null;
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
      args: 'search: $searchValue, limit: $limit',
      body: '{ list { _id number customerName } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TPutResponseNode>(payload, 'gs_mongolian_put_responses'),
  toItem: (putResponse) => ({
    id: putResponse._id,
    title: putResponse.number || UNNAMED,
    description: putResponse.customerName || undefined,
    path: '/mongolian/put-response',
  }),
});

type TExchangeRateNode = {
  _id: string;
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id mainCurrency rateCurrency rate } totalCount }',
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
    path: '/settings/mongolian/exchange-rates',
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  putResponsesSearchProvider,
  exchangeRatesSearchProvider,
];
