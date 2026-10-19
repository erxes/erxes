import { useQuery } from '@apollo/client';
import { GET_TICKET_NOTE } from '@/activity/graphql/queries/getTicketNote';

export const useGetTicketNote = (id: string | undefined) => {
  const { data, loading, refetch } = useQuery(GET_TICKET_NOTE, {
    variables: id ? { id } : undefined,
    skip: !id,
  });

  return { note: data?.ticketGetNote ?? undefined, loading, refetch };
};
