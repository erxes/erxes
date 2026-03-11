import { useQuery } from '@apollo/client';
import { PRODUCTS_CONFIGS } from '../graphql/queries/productsConfigs';

export interface IProductsConfig {
  _id: string;
  code: string;
  value?: boolean | string | string[];
}

export const useProductsConfigs = () => {
  const { data, loading } = useQuery<{ productsConfigs: IProductsConfig[] }>(
    PRODUCTS_CONFIGS,
  );

  const configs = data?.productsConfigs ?? [];
  const configsMap = configs.reduce<Record<string, unknown>>(
    (acc, { code, value }) => {
      acc[code] = value;
      return acc;
    },
    {},
  );

  return {
    configs,
    configsMap,
    loading,
  };
};
