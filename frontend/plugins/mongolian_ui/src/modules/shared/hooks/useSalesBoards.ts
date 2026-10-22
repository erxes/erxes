import { useQuery } from '@apollo/client';
import { GET_SALES_BOARDS } from '@/shared/graphql/salesQueries';
import { compactList } from '@/shared/utils/cursorList';

export const useGetSalesBoards = () => {
  const { data, loading, error } = useQuery(GET_SALES_BOARDS);

  return { boards: compactList(data?.salesBoards), loading, error };
};
