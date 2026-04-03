import { useMutation } from '@apollo/client';
import { TICKET_NUMBER_FORGET } from '../graphql/mutations';

export const useForgotTicketNumber = () => {
  const [mutate, { loading, error }] = useMutation(TICKET_NUMBER_FORGET);
  return {
    forgotTicketNumber: mutate,
    loading,
    error,
  };
};
