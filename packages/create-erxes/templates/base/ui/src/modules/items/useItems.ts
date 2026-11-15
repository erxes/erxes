import type { InferClientOutputs } from '@orpc/client';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Client } from '@__id__/api';
import { toast } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { orpc } from '~/orpc.ts';
import { useItemsFilter } from './ItemsFilter.tsx';

type Outputs = InferClientOutputs<Client>['items'];

export type Item = Outputs['create'];

/** Every page loaded so far, newest first, narrowed by the filter bar's search and member. */
export const useItems = () => {
  const filters = useItemsFilter();

  return useInfiniteQuery(
    orpc.items.list.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, ...filters }),
      initialPageParam: undefined,
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  );
};

/**
 * Deletes an item. It leaves every loaded list at once and comes back if the
 * API refuses; the lists refetch either way.
 */
export const useRemoveItem = () => {
  const { t } = useTranslation('__id__');
  const queryClient = useQueryClient();
  const lists = { queryKey: orpc.items.list.key() };

  return useMutation(
    orpc.items.remove.mutationOptions({
      onMutate: async ({ id }) => {
        await queryClient.cancelQueries(lists);
        const before = queryClient.getQueriesData<InfiniteData<Outputs['list']>>(lists);

        queryClient.setQueriesData<InfiniteData<Outputs['list']>>(lists, (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((item) => item.id !== id),
                })),
              }
            : data,
        );

        return { before };
      },
      onError: (error, _input, context) => {
        for (const [key, data] of context?.before ?? []) queryClient.setQueryData(key, data);
        toast({
          variant: 'destructive',
          title: t('delete-failed', 'Could not delete'),
          description: error.message,
        });
      },
      onSettled: () => queryClient.invalidateQueries(lists),
    }),
  );
};

/**
 * `?item=<id>` opens that item in the side panel, `?item=new` a blank one.
 * The filter bar's params stay as they are.
 */
export const useOpenItem = () => {
  const [openId, setOpenId] = useQueryState('item');

  return {
    openId,
    open: (id: string) => void setOpenId(id),
    close: () => void setOpenId(null),
  };
};
