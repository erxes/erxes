import { OperationVariables, useQuery } from '@apollo/client';
import { GET_TAG_DETAIL } from '../graphql/queries/tagsQueries';

export const useTagDetail = (options: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_TAG_DETAIL, {
    ...options,
    skip: !options?.variables?.id,
  });
  const tagDetail = data?.tagDetail || null;

  return {
    tagDetail,
    loading,
    error,
  };
};
