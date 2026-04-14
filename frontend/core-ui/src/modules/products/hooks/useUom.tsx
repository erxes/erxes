import { uomQuery } from '@/products/graphql/UomQuery';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { IUom } from 'ui-modules';

export const useUom = (options: QueryHookOptions) => {
  const { data, loading } = useQuery<{ uoms: IUom[] }>(uomQuery, options);
  return {
    uoms: data?.uoms || [],
    loading,
  };
};
