import type { Product } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { patchCachedRecord, useCursorList } from '~/lib/cursorList';
import { useCan } from '~/modules/auth/session';
import { useAdvancedFilterParam } from '~/modules/views/useViews';

/** RecordTable remembers the scroll position of the list under this key. */
export const PRODUCTS_SESSION_KEY = 'core_products_cursor';

/** Whether the member may add, edit and archive products and categories. */
export const useCanManageProducts = () => useCan()('products.manage');

/** The list filters, read from the URL: the search, the filter (views save both) and archived or not. */
export const useProductsFilters = () => {
  const [{ searchValue, archived }] = useMultiQueryState<{
    searchValue: string;
    archived: boolean;
  }>(['searchValue', 'archived']);

  return {
    search: searchValue || undefined,
    filter: useAdvancedFilterParam(),
    status: archived === true ? ('archived' as const) : ('active' as const),
  };
};

export const useProducts = () => {
  const filters = useProductsFilters();

  return useCursorList<Product>({
    sessionKey: PRODUCTS_SESSION_KEY,
    filters,
    options: (paging) =>
      orpc.products.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

export const useProduct = (id: string | null) =>
  useQuery(orpc.products.get.queryOptions({ input: { id: id ?? '' }, enabled: !!id }));

/** Puts a saved product in every cached list and its own query, then refetches the lists. */
const useStoreProduct = () => {
  const client = useQueryClient();

  return (product: Product) => {
    patchCachedRecord(client, orpc.products.list.key(), product);
    client.setQueryData(orpc.products.get.queryKey({ input: { id: product.id } }), product);
    void client.invalidateQueries({ queryKey: orpc.products.list.key() });
  };
};

/** Callers show failures next to the field they are about (`PRODUCT_CODE_EXISTS`). */
export const useProductCreate = () => {
  const store = useStoreProduct();

  return useMutation(orpc.products.create.mutationOptions({ onSuccess: store }));
};

/** Callers show failures next to the field they are about. */
export const useProductUpdate = () => {
  const store = useStoreProduct();

  return useMutation(orpc.products.update.mutationOptions({ onSuccess: store }));
};

/** Archive or restore, with a toast either way. */
export const useProductStatus = () => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const store = useStoreProduct();

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('save-failed', 'Could not save the product'),
      description: messageOf(error),
    });

  const archive = useMutation(
    orpc.products.archive.mutationOptions({
      onSuccess: (product) => {
        store(product);
        toast({
          variant: 'success',
          title: t('archived-toast', '{{name}} archived', { name: product.name }),
        });
      },
      onError,
    }),
  );

  const restore = useMutation(
    orpc.products.restore.mutationOptions({
      onSuccess: (product) => {
        store(product);
        toast({
          variant: 'success',
          title: t('restored-toast', '{{name}} restored', { name: product.name }),
        });
      },
      onError,
    }),
  );

  return { archive, restore };
};
