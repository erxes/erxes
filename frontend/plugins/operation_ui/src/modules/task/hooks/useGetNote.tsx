import { useQuery } from '@apollo/client';
import { GET_NOTE } from '@/task/graphql/queries/getNote';

export const useGetNote = (id: string | null | undefined) => {
  const { data, loading, refetch } = useQuery(GET_NOTE, {
    variables: id ? { id } : undefined,
    skip: !id,
  });

  return { note: data?.getNote, loading, refetch };
};
