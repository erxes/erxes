import { useQuery } from '@apollo/client';
import { GET_TICKET_REPLY_TARGET } from '@/activity/graphql/queries/getTicketReplyTarget';

export const useTicketReplyTarget = (ticketId: string) => {
  const { data, loading, error } = useQuery(GET_TICKET_REPLY_TARGET, {
    variables: { ticketId },
    skip: !ticketId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    replyTarget: data?.mailTicketReplyTarget ?? null,
    loading,
    error,
  };
};
