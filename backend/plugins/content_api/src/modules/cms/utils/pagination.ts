import type { FieldNode, GraphQLResolveInfo, SelectionSetNode } from 'graphql';
import type { FilterQuery } from 'mongoose';
import {
  buildCursorQuery,
  encodeCursor,
  type CursorPaginateParams,
  type PageInfo,
} from 'erxes-api-shared/utils';

/**
 * Same ordering, cursors and page info as the shared `cursorPaginate`, without
 * its count. Counting matching posts on every public list call scans the
 * index range of the whole filter, which is costly on large sites when the
 * caller never reads the total.
 */
export const cursorPaginateList = async <T>({
  model,
  params,
  query,
}: CursorPaginateParams<T>): Promise<{ list: T[]; pageInfo: PageInfo }> => {
  const { limit = 20, cursor, direction = 'forward', orderBy = {} } = params;

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const baseQuery: FilterQuery<T> = cursor
    ? {
        $and: [query || {}, buildCursorQuery(cursor, orderBy, direction)],
      }
    : { ...(query || {}) };

  const sortOrder: Record<string, 1 | -1> = {};

  for (const [field, order] of Object.entries(orderBy)) {
    const ascending = order === 1 || order === 'asc';
    const forward = direction === 'forward';
    sortOrder[field] = ascending === forward ? 1 : -1;
  }

  sortOrder._id = direction === 'forward' ? 1 : -1;

  const items = await model
    .find(baseQuery)
    .sort(sortOrder)
    .limit(limit + 1)
    .lean<T[]>();

  const hasMore = items.length > limit;
  const list = hasMore ? items.slice(0, limit) : items;

  if (direction === 'backward') {
    list.reverse();
  }

  const sortFields = Object.keys(orderBy);

  return {
    list,
    pageInfo: {
      hasNextPage: direction === 'forward' ? hasMore : Boolean(cursor),
      hasPreviousPage: direction === 'backward' ? hasMore : Boolean(cursor),
      startCursor: list.length ? encodeCursor(list[0], sortFields) : null,
      endCursor: list.length
        ? encodeCursor(list[list.length - 1], sortFields)
        : null,
    },
  };
};

const selectsField = (
  selectionSet: SelectionSetNode | undefined,
  fieldName: string,
  info: GraphQLResolveInfo,
): boolean =>
  (selectionSet?.selections ?? []).some((selection) => {
    if (selection.kind === 'Field') {
      return selection.name.value === fieldName;
    }

    if (selection.kind === 'InlineFragment') {
      return selectsField(selection.selectionSet, fieldName, info);
    }

    const fragment = info.fragments[selection.name.value];

    return selectsField(fragment?.selectionSet, fieldName, info);
  });

/**
 * Whether the client selected `fieldName` directly on the resolved field.
 * Without `info` (internal calls) it answers true so callers keep the total.
 */
export const isFieldRequested = (
  info: GraphQLResolveInfo | undefined,
  fieldName: string,
): boolean =>
  !info ||
  info.fieldNodes.some((node: FieldNode) =>
    selectsField(node.selectionSet, fieldName, info),
  );
