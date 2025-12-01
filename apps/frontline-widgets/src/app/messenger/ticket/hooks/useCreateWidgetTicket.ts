import { CREATE_TICKET, SAVE_TICKET_CUSTOMERS } from '../graphql';
import { useMutation } from '@apollo/client';

export const useCreateWidgetTicket = () => {
  const [createTicket, { loading, error }] = useMutation(CREATE_TICKET);
  const [
    saveTicketCustomers,
    { loading: saveTicketCustomersLoading, error: saveTicketCustomersError },
  ] = useMutation(SAVE_TICKET_CUSTOMERS);

  return {
    createTicket,
    saveTicketCustomers,
    loading,
    error,
    saveTicketCustomersLoading,
    saveTicketCustomersError,
  };
};
