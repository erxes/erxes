import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { onLocalChangeAtom } from '../productTableAtom';
import { useAtomValue } from 'jotai';
import { useRef } from 'react';
import { useDealsEditProductData } from './mutations/useDealsEditProductData';
import { IProductData } from 'ui-modules';
import { PRODUCTS_EDIT } from 'ui-modules/modules/products/graphql/mutations/productMutations';
import { useTranslation } from 'react-i18next';

import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';

interface ProductsEditData {
  productsEdit: {
    __typename: 'Product';
    _id: string;
    name: string;
  };
}

interface ProductsEditVariables {
  _id: string;
  name: string;
}

export const useUpdateProductRecord = () => {
  const { editDealsProductData } = useDealsEditProductData();
  const [productsEdit] = useMutation<ProductsEditData, ProductsEditVariables>(
    PRODUCTS_EDIT,
  );
  const processId = localStorage.getItem('processId') || '';
  const onLocalChange = useAtomValue(onLocalChangeAtom);
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const latestNameEditRef = useRef<Record<string, number>>({});

  const updateRecord = (
    product: IProductData,
    patch: Partial<IProductData>,
  ) => {
    const doc = { ...product, ...patch };

    if (onLocalChange && product._id) {
      onLocalChange(product._id, patch);
    }

    const request = editDealsProductData({
      variables: {
        processId,
        dataId: product._id,
        doc,
      },
    });

    // Rollback attaches here so fire-and-forget callers don't surface an
    // unhandled rejection; awaiting callers still observe the failure.
    request.catch(() => {
      if (onLocalChange && product._id) {
        const revertPatch = Object.fromEntries(
          Object.keys(patch).map((key) => [
            key,
            product[key as keyof IProductData],
          ]),
        ) as Partial<IProductData>;

        onLocalChange(product._id, revertPatch);
      }
    });

    return request;
  };

  const updateProductName = async (productData: IProductData, name: string) => {
    const product = productData.product;

    if (!product) {
      return;
    }

    const productId = productData.productId || product._id;
    const nextProduct = { ...product, _id: productId, name };

    const operationId = (latestNameEditRef.current[productId] || 0) + 1;
    latestNameEditRef.current[productId] = operationId;

    if (onLocalChange && productData._id) {
      onLocalChange(
        productData._id,
        { product: nextProduct },
        { syncProductId: productId },
      );
    }

    try {
      await productsEdit({
        variables: {
          _id: productId,
          name,
        },
        optimisticResponse: {
          productsEdit: {
            __typename: 'Product',
            _id: productId,
            name,
          },
        },
      });

      toast({
        title: t('success'),
        variant: 'success',
        ...DEAL_TOAST_OPTIONS,
      });
    } catch (error) {
      const isLatestEdit = latestNameEditRef.current[productId] === operationId;

      if (isLatestEdit && onLocalChange && productData._id) {
        onLocalChange(
          productData._id,
          { product },
          { syncProductId: productId },
        );
      }

      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('update-failed'),
        variant: 'destructive',
        ...DEAL_TOAST_OPTIONS,
      });
    }
  };

  return { updateProductName, updateRecord };
};
