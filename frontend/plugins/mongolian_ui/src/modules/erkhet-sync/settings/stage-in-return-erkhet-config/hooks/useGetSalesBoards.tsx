import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SALES_BOARDS } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/graphql/queries/salesBoards';
import { IBoard } from '../types/board';


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
