import { useMutation } from '@apollo/client';
import { ADD_PAYMENT } from '../graphql/mutations';
import { PAYMENTS } from '../graphql/queries';

export const usePaymentAdd = () => {
  const [addPayment] = useMutation(ADD_PAYMENT, {
    refetchQueries: [PAYMENTS],
  });

  return { addPayment };
};
