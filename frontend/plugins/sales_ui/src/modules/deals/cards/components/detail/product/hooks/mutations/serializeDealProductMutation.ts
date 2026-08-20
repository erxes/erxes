import type { ApolloClient } from '@apollo/client';
import type { IProductData } from 'ui-modules';

import { updateDealProductsCache } from './updateDealProductsCache';

interface DealProductMutationQueue {
  tail: Promise<void>;
  token: symbol;
}

const dealProductMutationQueues = new Map<string, DealProductMutationQueue>();

export const withDealIdVariables = <TOptions extends { variables: object }>(
  options: TOptions,
  dealId: string,
) => ({
  ...options,
  variables: { ...options.variables, dealId },
});

interface SerializeDealProductMutationOptions<TResult> {
  client: ApolloClient<object>;
  dealId: string;
  mutation: () => Promise<TResult>;
  selectProductsData: (result: TResult) => IProductData[] | undefined;
}

export const serializeDealProductMutation = <TResult>({
  client,
  dealId,
  mutation,
  selectProductsData,
}: SerializeDealProductMutationOptions<TResult>): Promise<TResult> => {
  const previous =
    dealProductMutationQueues.get(dealId)?.tail || Promise.resolve();
  const result = previous.then(async () => {
    const mutationResult = await mutation();
    const productsData = selectProductsData(mutationResult);

    if (productsData) {
      updateDealProductsCache(client, dealId, productsData);
    }

    return mutationResult;
  });
  const token = Symbol(dealId);
  const clearCompletedQueue = () => {
    if (dealProductMutationQueues.get(dealId)?.token === token) {
      dealProductMutationQueues.delete(dealId);
    }
  };
  const tail = result.then(clearCompletedQueue, clearCompletedQueue);

  dealProductMutationQueues.set(dealId, { tail, token });

  return result;
};
