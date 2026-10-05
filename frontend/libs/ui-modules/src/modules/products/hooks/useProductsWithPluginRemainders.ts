import { useApolloClient } from '@apollo/client';
import type { TProductRemainderProvider } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { pluginsConfigState } from '../../../states/pluginsConfigState';
import { IProduct } from '../types/Product';

type UseProductsWithPluginRemaindersParams = {
  products: IProduct[];
  pipelineId?: string;
};

export const useProductsWithPluginRemainders = ({
  products,
  pipelineId,
}: UseProductsWithPluginRemaindersParams) => {
  const client = useApolloClient();
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const [resolvedProducts, setResolvedProducts] = useState<IProduct[]>(products);

  const providers = useMemo(
    () =>
      Object.values(pluginsConfig || {}).flatMap(
        (config) => config.widgets?.productRemainderProviders || [],
      ),
    [pluginsConfig],
  );

  const productIdsKey = useMemo(
    () => products.map((product) => product._id).join(','),
    [products],
  );

  useEffect(() => {
    let mounted = true;
    setResolvedProducts(products);

    if (!products.length || !providers.length) {
      return () => {
        mounted = false;
      };
    }

    const applyRemainderProviders = async (
      remainderProviders: TProductRemainderProvider[],
    ) => {
      const patches = await Promise.all(
        remainderProviders.map((provider) =>
          provider({
            products,
            pipelineId,
            query: client.query.bind(client),
          }),
        ),
      );

      if (!mounted) {
        return;
      }

      const patchByProductId = new Map(
        patches.flat().map((patch) => [patch._id, patch.remainder]),
      );

      if (!patchByProductId.size) {
        return;
      }

      setResolvedProducts((currentProducts) =>
        currentProducts.map((product) => {
          const remainder = patchByProductId.get(product._id);

          if (!remainder) {
            return product;
          }

          return {
            ...product,
            remainder: {
              ...product.remainder,
              ...remainder,
            },
          };
        }),
      );
    };

    applyRemainderProviders(providers).catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [client, pipelineId, productIdsKey, products, providers]);

  return resolvedProducts;
};
