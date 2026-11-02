import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_CTAX_VALUE } from '@/settings/ctax/graphql/queries/getCtaxs';

export const useCtaxRowDetail = (ctaxRowId?: string) => {
  const { data: queryData, loading } = useQuery(GET_CTAX_VALUE, {
    variables: { id: ctaxRowId ?? '' },
    skip: !ctaxRowId,
  });
  const data = toGraphqlView(queryData);

  return {
    ctaxRowDetail: data?.ctaxRowDetail,
    loading,
  };
};
