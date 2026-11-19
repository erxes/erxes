import { useApolloClient, useMutation } from '@apollo/client';
import { productsMutations, productsQueries } from '@/products/graphql';

export type RestoreProductsResult = {
  restoredIds: string[];
  failedIds: string[];
  errorMessage?: string;
  refreshFailed: boolean;
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

    const restoredIds: string[] = [];
    const failedIds: string[] = [];
    let errorMessage: string | undefined;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        restoredIds.push(productIds[index]);
        return;
      }

      failedIds.push(productIds[index]);
      errorMessage ??= getErrorMessage(result.reason);
    });

    let refreshFailed = false;

    try {
      client.cache.evict({ fieldName: 'productsMain' });
      client.cache.gc();
      await client.refetchQueries({
        include: [productsQueries.productsMain],
      });
    } catch {
      refreshFailed = true;
    }

    return { restoredIds, failedIds, errorMessage, refreshFailed };
  };

  return { restoreProducts, loading };
};
