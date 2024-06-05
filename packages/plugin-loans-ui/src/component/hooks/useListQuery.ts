import { useQuery, gql, QueryHookOptions } from '@apollo/client';

interface MainType {
  loading: boolean;
}

type ResponseType<T, K> = {
  [Field in keyof K]: { list: T[]; totalCount: number };
};

function useListQuery<T, K>(
  query: string,
  options: QueryHookOptions,
  field: keyof K
) {
  const mainQuery = useQuery<ResponseType<T, K> & MainType>(
    gql(query),
    options
  );

  return {
    list: mainQuery.data?.[field]?.list ?? [],
    totalCount: mainQuery.data?.[field]?.totalCount,
    ...mainQuery
  };
}

export default useListQuery;
