import { skipToken, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

type Rows<T> = UseQueryOptions<{ data: T[] }, Error, { data: T[] }>;

/**
 * Records by id, read with one request per set of ids (sorted, so every order of the same ids
 * shares the cache), and no request without ids.
 */
export const useRowsById = <T extends { id: string }>(
  queryFor: (ids: string[]) => Rows<T>,
  ids: readonly string[],
) => {
  const sorted = [...new Set(ids)].toSorted((a, b) => a.localeCompare(b));

  const query = useQuery(
    sorted.length ? queryFor(sorted) : { queryKey: ['erxes-ui', 'no-rows'], queryFn: skipToken },
  );

  const data = query.data?.data;
  const byId = useMemo(() => new Map((data ?? []).map((row) => [row.id, row])), [data]);

  return { byId, loading: sorted.length > 0 && query.isPending };
};
