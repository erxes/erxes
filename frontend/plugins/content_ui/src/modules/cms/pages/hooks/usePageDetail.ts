import { useQuery } from '@apollo/client';
import { PAGE_DETAIL } from '@/cms/pages/graphql';
import { IPage } from '../types/pageTypes';

export const usePageDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery(PAGE_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const page = (data?.cmsPage || {}) as IPage;

  return {
    page,
    loading,
    error,
    refetch,
  };
};
