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
import { useTranslation } from 'react-i18next';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';

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

/**
 * Creates a tag and adds it to its type's list. A failure is a toast, except a taken name when
 * `onTaken` shows it by the name field.
 */
export const useTagCreate = ({ onTaken }: { onTaken?: (message: string) => void } = {}) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

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
      onError: (error) => {
        if (onTaken && isApiError(error, 'TAKEN')) {
          onTaken(t('name-taken', 'A tag with this name is already there.'));

          return;
        }

        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not create the tag'),
          description: messageOf(error),
        });
      },
    }),
  );
};
