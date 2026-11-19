import { useApolloClient, useMutation } from '@apollo/client';
import { productsMutations, productsQueries } from '@/products/graphql';

export type RestoreProductsResult = {
  restoredCount: number;
  failedIds: string[];
  errorMessage?: string;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useRestoreProducts = () => {
  const client = useApolloClient();
  const [_restoreProduct, { loading }] = useMutation(
    productsMutations.productsEdit,
  );

  const restoreProducts = async (
    productIds: string[],
  ): Promise<RestoreProductsResult> => {
    const results = await Promise.allSettled(
      productIds.map((_id) => _restoreProduct({ variables: { _id } })),
    );

    const failedIds: string[] = [];
    let errorMessage: string | undefined;

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedIds.push(productIds[index]);
        errorMessage ??= getErrorMessage(result.reason);
      }
    });

    const restoredCount = productIds.length - failedIds.length;

    if (restoredCount > 0) {
      client.cache.evict({ fieldName: 'productsMain' });
      client.cache.gc();
      await client.refetchQueries({
        include: [productsQueries.productsMain],
      });
    }

    return { restoredCount, failedIds, errorMessage };
  };

  return { restoreProducts, loading };
};
