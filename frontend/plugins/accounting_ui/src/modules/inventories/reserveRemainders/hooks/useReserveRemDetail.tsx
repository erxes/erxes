import { useQuery } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { RESERVE_REM_DETAIL_QUERY } from '@/inventories/reserveRemainders/graphql/reserveRemQueries';

export const useReserveRemDetail = (reserveRemId?: string) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(RESERVE_REM_DETAIL_QUERY, {
    variables: { _id: reserveRemId ?? '' },
    skip: !reserveRemId,
  });
  const data = toGraphqlView(queryData);

  return {
    reserveRemDetail: data?.reserveRemDetail,
    loading,
    error,
  };
};
