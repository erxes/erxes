import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_POS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/salesPoss';
import { IPos } from '@/ebarimt/settings/pos-in-ebarimt-config/types/pos';


interface IUseGetSalesPossResponse {
  salesPoss: IPos[];
}

interface UseGetSalesPossOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetSalesPoss = (
  options?: UseGetSalesPossOptions,
) => {
  const { data, loading, error } = useQuery<IUseGetSalesPossResponse>(
    GET_SALES_POS,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      skip: options?.skip,
    },
  );

  return {
    poss: data?.salesPoss || [],
    loading,
    error,
  };
};
