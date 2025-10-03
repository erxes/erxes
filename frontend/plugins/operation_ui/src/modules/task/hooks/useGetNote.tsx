import { useQuery } from '@apollo/client';
import { GET_NOTE } from '@/task/graphql/queries/getNote';
import { INote } from '@/task/types';

interface IGetNoteQueryResponse {
  getNote: INote;
}

export const useGetNote = (id: string | undefined) => {
  const { data, loading, refetch } = useQuery<IGetNoteQueryResponse>(GET_NOTE, {
    variables: {
      id,
    },
    skip: !id,
  });

  return { note: data?.getNote, loading, refetch };
};
