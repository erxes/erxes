import { useQuery } from '@apollo/client';
import { GET_NOTE } from '@/task/graphql/queries/getNote';

export const useGetNote = (id: string | undefined) => {
  const { data, loading, refetch } = useQuery(GET_NOTE, {
    variables: { id: id ?? '' },
    skip: !id,
  });

  return { note: data?.getNote ?? undefined, loading, refetch };
};
