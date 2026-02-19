import { useMutation } from '@apollo/client';
import { GET_TICKETS } from '../graphql/queries/getTickets';
import { REMOVE_TICKET } from '../graphql/mutations/removeTicket';

export const useTicketRemove = () => {
  const [_removeTicket, { loading }] = useMutation(REMOVE_TICKET);

  const removeTicket = async (ticketId: string) => {
    await _removeTicket({
      variables: { _id: ticketId },
      refetchQueries: [GET_TICKETS],
    });
  };

  return { removeTicket, loading };
};
