import { useQuery, gql, QueryHookOptions } from '@apollo/client';

interface MainType {
  loading: boolean;
}

type ResponseType<T, K> = {
  [Field in keyof K]: T;
};

function useDetailQuery<T, K>(
  query: string,
  options: QueryHookOptions,
  field: keyof K
) {
  const mainQuery = useQuery<ResponseType<T, K> & MainType>(
    gql(query),
    options
  );

  return {
    detail: mainQuery.data?.[field],
    ...mainQuery
  };
}

export default useDetailQuery;
