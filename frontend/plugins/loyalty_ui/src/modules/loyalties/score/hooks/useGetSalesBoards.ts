import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_BOARDS } from '../graphql/salesQueries';

interface IBoard {
  _id: string;
  name: string;
  pipelines?: { _id: string; name: string }[];
}

interface IResponse {
  salesBoards: IBoard[];
}

export const useGetSalesBoards = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<IResponse>(GET_SALES_BOARDS, {
    errorPolicy: 'all',
    ...options,
  });
  return { boards: data?.salesBoards || [], loading, error };
};
