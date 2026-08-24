import { IconBriefcase, IconTag } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readArray,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TDealNode = {
  _id: string;
  createdAt?: string | null;
  name?: string | null;
  number?: string | null;
  description?: string | null;
  customers?: Array<{
    primaryPhone?: string | null;
    phones?: string[] | null;
  }> | null;
  boardId?: string | null;
  pipeline?: { _id: string; boardId?: string | null } | null;
};

const dealsSearchProvider = defineSearchProvider<TDealNode>({
  key: 'sales-deals',
  label: 'Deals',
  labelKey: 'deals',
  labelNamespace: 'common',
  icon: IconTag,
  order: 100,
  selections: [
    {
      alias: 'gs_sales_deals',
      field: 'deals',
      args: 'search: $searchValue, noSkipArchive: true, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id name number description boardId createdAt customers { primaryPhone phones } pipeline { _id boardId } } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) => readCursorList<TDealNode>(payload, 'gs_sales_deals'),
  toItem: (deal) => {
    const boardId = deal.boardId || deal.pipeline?.boardId;
    const pipelineId = deal.pipeline?._id;

    if (!boardId || !pipelineId) {
      return null;
    }

    return {
      id: deal._id,
      title: deal.name || UNNAMED,
      description: deal.number ? `#${deal.number}` : undefined,
      createdAt: deal.createdAt ?? undefined,
      matchFields: [
        { label: 'Deal number', value: deal.number },
        { label: 'Description', value: deal.description },
        { label: 'Created date', value: deal.createdAt },
        ...(deal.customers ?? []).flatMap((customer) => [
          { label: 'Customer phone', value: customer.primaryPhone },
          ...(customer.phones ?? []).map((phone) => ({
            label: 'Customer phone',
            value: phone,
          })),
        ]),
      ].flatMap(({ label, value }) => (value ? [{ label, value }] : [])),
      path: `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    };
  },
});

type TPosNode = {
  _id: string;
  createdAt?: string | null;
  name?: string | null;
};

const posSearchProvider = defineSearchProvider<TPosNode>({
  key: 'sales-pos',
  label: 'POS',
  icon: IconBriefcase,
  order: 105,
  selections: [
    {
      alias: 'gs_sales_pos',
      field: 'posList',
      args: 'search: $searchValue, perPage: $limit, sortField: $sortField, sortDirection: $sortDirection',
      body: '{ _id name createdAt }',
    },
  ],
  select: (payload) => {
    const nodes = readArray<TPosNode>(payload, 'gs_sales_pos');
    return {
      nodes,
      totalCount: nodes.length,
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  },
  toItem: (pos) => ({
    id: pos._id,
    title: pos.name || UNNAMED,
    createdAt: pos.createdAt ?? undefined,
    path: `/sales/pos/${pos._id}/orders`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  dealsSearchProvider,
  posSearchProvider,
];
