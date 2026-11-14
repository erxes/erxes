import type { ContentType } from '@erxes/core-contract';
import {
  type SkipToken,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useMemo } from 'react';
import { messageOf, orpc } from '~/lib/api';

/** Tag colours offered when creating one. */
export const TAG_COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#64748b',
];

/** All tags of a type (an organisation has few): one request and cache entry per type. */
export const tagsQuery = (type: ContentType | SkipToken) =>
  orpc.tags.list.queryOptions({
    input: type === skipToken ? skipToken : { type },
    staleTime: 60_000,
  });

/** All tags of a type, with a by-id lookup. */
export const useTags = (type: ContentType) => {
  const query = useQuery(tagsQuery(type));
  const tags = useMemo(() => query.data?.data ?? [], [query.data]);
  const byId = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  return { tags, byId, loading: query.isPending, error: query.error };
};

export const useTagCreate = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.tags.create.mutationOptions({
      onSuccess: (tag) =>
        client.setQueryData(tagsQuery(tag.type).queryKey, (cache) =>
          cache
            ? {
                ...cache,
                data: [...cache.data, tag].toSorted((a, b) => a.name.localeCompare(b.name)),
              }
            : cache,
        ),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not create the tag',
          description: messageOf(error),
        }),
    }),
  );
};
