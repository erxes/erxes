import { useMutation } from '@apollo/client';
import { SAVE_CUSTOMER_NOTIFIED } from '../graphql/mutations';

export const useNotifyCustomer = () => {
  const [saveCustomerNotified, { loading }] = useMutation(
    SAVE_CUSTOMER_NOTIFIED,
  );
  return {
    saveCustomerNotified,
    loading,
  };
};
