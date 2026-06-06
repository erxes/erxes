type BuildExportCursorQueryArgs = {
  baseQuery?: Record<string, any>;
  cursor?: string;
  ids?: string[];
  limit?: number;
};

type BuildExportCursorQueryResult = {
  query: Record<string, any>;
  isIdsMode: boolean;
};

export const normalizeExportLimit = (
  limit?: number,
  fallback = 100,
): number => {
  return limit && limit > 0 ? limit : fallback;
};

export const buildExportCursorQuery = ({
  baseQuery = {},
  cursor,
  ids,
  limit = 100,
}: BuildExportCursorQueryArgs): BuildExportCursorQueryResult => {
  const query = { ...baseQuery };
  const hasIds = Boolean(ids?.length);

  if (hasIds) {
    const processedCount = cursor ? Number.parseInt(cursor, 10) || 0 : 0;
    const remainingIds = ids!.slice(processedCount);

    if (remainingIds.length === 0) {
      query._id = { $in: [] };
      return { query, isIdsMode: true };
    }

    query._id = { $in: remainingIds.slice(0, limit) };
    return { query, isIdsMode: true };
  }

  if (cursor) {
    query._id = query._id ? { ...query._id, $gt: cursor } : { $gt: cursor };
  }

  return { query, isIdsMode: false };
};
