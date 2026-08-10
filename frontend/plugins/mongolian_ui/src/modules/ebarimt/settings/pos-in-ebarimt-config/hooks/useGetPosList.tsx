import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_POS_LIST } from '~/modules/ebarimt/settings/pos-in-ebarimt-config/graphql/posList';
import { IPos } from '@/ebarimt/settings/pos-in-ebarimt-config/types/pos';


interface IUseGetPoslistResponse {
  posList: IPos[];
}

interface UseGetPoslistOptions extends QueryHookOptions {
  skip?: boolean;
}

export const useGetPoslist = (
  options?: UseGetPoslistOptions,
) => {
  const { data, loading, error } = useQuery<IUseGetPoslistResponse>(
    GET_POS_LIST,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      skip: options?.skip,
    },
  );

  return {
    poss: data?.posList || [],
    loading,
    error,
  };
};
