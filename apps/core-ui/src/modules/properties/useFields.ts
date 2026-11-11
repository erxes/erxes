import type { ContentType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export const FIELDS_KEY = ['fields'];

/** The organisation's custom fields of a record type, in order. */
export const useFields = (contentType: ContentType) => {
  const query = useQuery({
    queryKey: [...FIELDS_KEY, contentType],
    queryFn: () => api.fields.list({ contentType }),
    staleTime: 60_000,
  });

  return { fields: query.data?.data ?? [], loading: query.isPending };
};
