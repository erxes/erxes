import { useMutation } from '@apollo/client';
import { EDIT_PAYMENT } from '../graphql/mutations';
import { PAYMENTS } from '../graphql/queries';

export const usePaymentEdit = () => {
  const [editPayment] = useMutation(EDIT_PAYMENT, {
    refetchQueries: [PAYMENTS],
  });

  return { editPayment };
};
