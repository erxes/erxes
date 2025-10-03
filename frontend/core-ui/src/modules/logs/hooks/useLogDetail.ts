import { LOG_DETAIL } from '@/logs/graphql/logQueries';
import { ILogDoc } from '@/logs/types';
import { useQuery } from '@apollo/client';

type QueryResponse = {
  logDetail: ILogDoc;
};

export const useLogDetail = (id: string) => {
  const { data, loading, error } = useQuery<QueryResponse>(LOG_DETAIL, {
    variables: { id },
  });

  return {
    detail: data?.logDetail,
    loading,
    error,
  };
};
