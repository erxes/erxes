import type { ContentType, Tag } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useMemo } from 'react';
import { api, messageOf } from '~/lib/api';

export const TAGS_KEY = ['tags'];

/** Tag colours offered when creating one (old erxes palette). */
export const TAG_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];

/** All tags of a type (an organisation has few), with a by-id lookup. */
export const useTags = (type: ContentType) => {
  const query = useQuery({
    queryKey: [...TAGS_KEY, type],
    queryFn: () => api.tags.list({ type }),
    staleTime: 60_000,
  });
  const tags = useMemo(() => query.data?.data ?? [], [query.data]);
  const byId = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  return { tags, byId, loading: query.isPending };
};

export const useTagCreate = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: { type: ContentType; name: string; colorCode?: string | null }) =>
      api.tags.create(input),
    onSuccess: (tag) =>
      client.setQueryData<{ data: Tag[] }>([...TAGS_KEY, tag.type], (cache) =>
        cache ? { data: [...cache.data, tag].sort((a, b) => a.name.localeCompare(b.name)) } : cache,
      ),
    onError: (error) => toast({ variant: 'destructive', title: 'Could not create the tag', description: messageOf(error) }),
  });
};
