import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';
import { IPos } from '../types/pos';

interface IPosDetailQueryResponse {
  posDetail: IPos;
}

export const usePosDetail = (posId?: string) => {
  const { data, loading, error } = useQuery<IPosDetailQueryResponse>(
    queries.posDetail,
    {
      variables: { _id: posId },
      skip: !posId,
    },
  );

  return {
    posDetail: data?.posDetail,
    loading,
    error,
  };
};
