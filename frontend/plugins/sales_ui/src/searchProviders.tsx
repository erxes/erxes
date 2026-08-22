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
  name?: string | null;
  number?: string | null;
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
      args: 'search: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id name number boardId pipeline { _id boardId } } totalCount pageInfo { hasNextPage endCursor } }',
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
      path: `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    };
  },
});

type TPosNode = {
  _id: string;
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
      body: '{ _id name }',
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
    path: `/sales/pos/${pos._id}/orders`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  dealsSearchProvider,
  posSearchProvider,
];
