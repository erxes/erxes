import {
  ISearchProvider,
  TSearchPageInfo,
  TSearchPayload,
  TSearchProviderDefinition,
} from '../types/UIConfig';
import { isAnObject } from './isAnObject';

export const readCursorList = <TNode>(
  payload: TSearchPayload,
  alias: string,
): { nodes: TNode[]; totalCount: number; pageInfo: TSearchPageInfo } => {
  const page = payload[alias];

  if (!isAnObject(page)) {
    return {
      nodes: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }

  const { list, totalCount, pageInfo } = page as {
    list?: TNode[];
    totalCount?: number;
    pageInfo?: Partial<TSearchPageInfo> | null;
  };

  return {
    nodes: Array.isArray(list) ? list : [],
    totalCount: totalCount ?? 0,
    pageInfo: {
      hasNextPage: pageInfo?.hasNextPage === true,
      endCursor:
        typeof pageInfo?.endCursor === 'string' ? pageInfo.endCursor : null,
    },
  };
};

export const readArray = <TNode>(
  payload: TSearchPayload,
  alias: string,
): TNode[] => {
  const value = payload[alias];

  return Array.isArray(value) ? (value as TNode[]) : [];
};

export const readNumber = (payload: TSearchPayload, alias: string): number =>
  typeof payload[alias] === 'number' ? (payload[alias] as number) : 0;

export const defineSearchProvider = <TNode>(
  definition: TSearchProviderDefinition<TNode>,
): ISearchProvider => ({
  key: definition.key,
  label: definition.label,
  labelKey: definition.labelKey,
  labelNamespace: definition.labelNamespace,
  icon: definition.icon,
  order: definition.order,
  selections: definition.selections,
  resolve: (payload, limit) => {
    const { nodes, totalCount, pageInfo } = definition.select(payload);
    const items = nodes
      .slice(0, limit)
      .map(definition.toItem)
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      items,
      totalCount: Math.max(totalCount ?? nodes.length, items.length),
      countMode: totalCount === undefined ? 'approximate' : 'exact',
      pageInfo,
    };
  },
});
