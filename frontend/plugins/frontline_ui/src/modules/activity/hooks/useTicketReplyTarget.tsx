import { useQuery } from '@apollo/client';
import { GET_TICKET_REPLY_TARGET } from '@/activity/graphql/queries/getTicketReplyTarget';
import { ITicketReplyTarget } from '@/activity/types';

interface ITicketReplyTargetResponse {
  mailTicketReplyTarget: ITicketReplyTarget | null;
}

export const useTicketReplyTarget = (ticketId: string) => {
  const { data, loading, error } = useQuery<ITicketReplyTargetResponse>(
    GET_TICKET_REPLY_TARGET,
    {
      variables: { ticketId },
      skip: !ticketId,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    replyTarget: data?.mailTicketReplyTarget ?? null,
    loading,
    error,
  };
};
