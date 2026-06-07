import { useMutation } from '@apollo/client';
import { REMOVE_PAYMENT } from '../graphql/mutations';
import { PAYMENTS } from '../graphql/queries';

export const usePaymentRemove = () => {
  const [removePayment] = useMutation(REMOVE_PAYMENT, {
    refetchQueries: [PAYMENTS],
  });

  return { removePayment };
};
