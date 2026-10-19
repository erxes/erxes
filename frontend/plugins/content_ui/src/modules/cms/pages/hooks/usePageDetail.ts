import { useQuery } from '@apollo/client';
import { PAGE_DETAIL } from '../graphql/queries/pageDetailQuery';

export const usePageDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery(PAGE_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const page = data?.cmsPage ?? undefined;

  return {
    page,
    loading,
    error,
    refetch,
  };
};
