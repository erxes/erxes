import { useApolloClient } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductFileLinks } from 'ui-modules/modules/products/hooks/useProductFiles';
import {
  ProductFormSchema,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';
import { PRODUCT_DETAIL_QUERY } from '@/products/product-detail/graphql/queries/productDetailQueries';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';
import {
  getProductFormDefaultValues,
  toProductEditVariables,
} from '@/products/product-detail/utils/productFormValues';

export type TProductPatch = Partial<ProductFormValues>;

// Fields the product list shows or sorts by. Other changes reach it through
// the cache: the saved product comes back in the response.
const LIST_FIELDS: (keyof ProductFormValues)[] = [
  'name',
  'code',
  'categoryId',
  'vendorId',
  'unitPrice',
];

const changesList = (patch: TProductPatch) =>
  LIST_FIELDS.some((field) => field in patch);

/**
 * Saves one change to the product shown in the side panel. `productsEdit`
 * re-derives barcodes and the UOM from the whole product, so each save sends
 * every field but its conditions (only their toggle changes those): the
 * cached product with the change on top. Saves run one at
 * a time, each from the product the previous one returned, so quick edits
 * never overwrite each other. Resolves the saved product, or `null`.
 */
export const useProductPanelSave = (productId: string) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { toast } = useToast();
  const client = useApolloClient();
  const { productsEdit } = useProductsEdit();
  const { linkFiles } = useProductFileLinks();
  const queue = useRef<Promise<ProductDetail | null>>(Promise.resolve(null));

  const saveNow = useCallback(
    async (patch: TProductPatch): Promise<ProductDetail | null> => {
      const cached = client.readQuery<{ productDetail: ProductDetail | null }>({
        query: PRODUCT_DETAIL_QUERY,
        variables: { _id: productId },
      });
      const base = getProductFormDefaultValues(cached?.productDetail ?? null);

      if (!base) {
        toast({
          title: t('errorTitle'),
          description: t('productIdMissing'),
          variant: 'destructive',
        });
        return null;
      }

      const parsed = ProductFormSchema.safeParse({ ...base, ...patch });

      if (!parsed.success) {
        toast({
          title: t('validationErrorTitle'),
          description:
            parsed.error.issues[0]?.message || t('validationErrorDescription'),
          variant: 'destructive',
        });
        return null;
      }

      const files = await linkFiles(parsed.data.files);

      if (!files) {
        return null;
      }

      try {
        const { data } = await productsEdit({
          variables: {
            ...toProductEditVariables({ ...parsed.data, files }),
            _id: productId,
          },
          // The list shows the category and vendor by name.
          refetchQueries: changesList(patch) ? ['ProductsMain'] : [],
        });
        return data?.productsEdit ?? null;
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: (error as Error).message || t('unknownError'),
          variant: 'destructive',
        });
        return null;
      }
    },
    [client, linkFiles, productId, productsEdit, t, toast],
  );

  const save = useCallback(
    (patch: TProductPatch) => {
      const next = queue.current.then(() => saveNow(patch));
      // A rejected save must not stop the ones queued after it.
      queue.current = next.catch(() => null);
      return next;
    },
    [saveNow],
  );

  return { save };
};
