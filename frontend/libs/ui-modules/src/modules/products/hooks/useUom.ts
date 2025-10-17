import { useQuery } from '@apollo/client';
import { QueryHookOptions } from '@apollo/client';

import { UOM_QUERY } from '../graphql/queries/productsQueries';
import { IUom } from '../types';

export const useUom = (options?: QueryHookOptions<{ uoms: IUom[] }>) => {
  const { data, loading } = useQuery<{ uoms: IUom[] }>(UOM_QUERY, options);
  return {
    uoms: data?.uoms || [],
    loading,
  };
};
