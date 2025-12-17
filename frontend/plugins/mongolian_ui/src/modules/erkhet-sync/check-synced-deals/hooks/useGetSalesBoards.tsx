import { useQuery, QueryHookOptions } from '@apollo/client';
import { IBoard } from '../types/board';
import { GET_SALES_BOARDS } from '../graphql/queries/salesBoards';



interface IUseGetSalesBoardsResponse {
  salesBoards: IBoard[];
}
export const useGetSalesBoards = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<IUseGetSalesBoardsResponse>(
    GET_SALES_BOARDS,
    options,
  );

  return { boards: data?.salesBoards || [], loading, error };
};
