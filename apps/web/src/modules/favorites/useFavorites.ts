import type { Favorite } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

/** Where the member is, as a favorite stores it: the path and its query. */
export const useCurrentPath = () => {
  const { pathname, search } = useLocation();

  return `${pathname.replace(/\/+$/, '') || '/'}${search}`;
};

/**
 * The member's favorites, in their order, and what changes them. Each change
 * puts the list it gets back in place, so the star and the lists follow at once.
 */
export const useFavorites = () => {
  const { t } = useTranslation('common', { keyPrefix: 'favorites' });
  const { toast } = useToast();
  const client = useQueryClient();
  const listKey = orpc.favorites.list.queryKey();

  const favorites = useQuery(orpc.favorites.list.queryOptions({ staleTime: 60_000 })).data?.data;

  const put = (change: (rows: Favorite[]) => Favorite[]) =>
    client.setQueryData(listKey, (list) => list && { data: change(list.data) });

  const onError = (error: Error) => {
    toast({
      variant: 'destructive',
      title: t('failed', 'Favorites not saved'),
      description: messageOf(error),
    });
    void client.invalidateQueries({ queryKey: listKey });
  };

  const add = useMutation(
    orpc.favorites.add.mutationOptions({
      onSuccess: (row) =>
        put((rows) =>
          [...rows.filter(({ id }) => id !== row.id), row].toSorted(
            (a, b) => a.position - b.position,
          ),
        ),
      onError,
    }),
  );

  const rename = useMutation(
    orpc.favorites.rename.mutationOptions({
      onSuccess: (row) => put((rows) => rows.map((each) => (each.id === row.id ? row : each))),
      onError,
    }),
  );

  const remove = useMutation(
    orpc.favorites.remove.mutationOptions({
      onMutate: ({ id }) => put((rows) => rows.filter((row) => row.id !== id)),
      onError,
    }),
  );

  const reorder = useMutation(
    orpc.favorites.reorder.mutationOptions({
      onMutate: ({ ids }) =>
        put((rows) => ids.flatMap((id) => rows.filter((row) => row.id === id))),
      onSuccess: (list) => client.setQueryData(listKey, list),
      onError,
    }),
  );

  return { favorites: favorites ?? [], add, rename, remove, reorder };
};
