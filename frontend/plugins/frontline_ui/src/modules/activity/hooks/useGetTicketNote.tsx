import { useQuery } from '@apollo/client';
import { GET_TICKET_NOTE } from '@/activity/graphql/queries/getTicketNote';
import { INote } from '@/activity/types';

interface IGetNoteQueryResponse {
  ticketGetNote: INote;
}

export const useGetTicketNote = (id: string | undefined) => {
  const { data, loading, refetch } = useQuery<IGetNoteQueryResponse>(GET_TICKET_NOTE, {
    variables: {
      id,
    },
    skip: !id,
  });

  return { note: data?.ticketGetNote, loading, refetch };
};
