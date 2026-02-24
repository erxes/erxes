import { useUpdateTicket } from './useUpdateTicket';

export const useTicketCustomFieldEdit = () => {
  const { updateTicket, loading: updateTicketLoading } = useUpdateTicket();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      updateTicket({
        variables: { ...variables },
      }),
    loading: updateTicketLoading,
  };
};
