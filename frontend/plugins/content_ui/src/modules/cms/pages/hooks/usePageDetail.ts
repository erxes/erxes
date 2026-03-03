import { useQuery } from '@apollo/client';
import { PAGE_DETAIL } from '../graphql/queries/pageDetailQuery';
import { IPage } from '../types/pageTypes';

export const usePageDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery(PAGE_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const page = (data?.cmsPageDetail || {}) as IPage;

  return {
    page,
    loading,
    error,
    refetch,
  };
};
