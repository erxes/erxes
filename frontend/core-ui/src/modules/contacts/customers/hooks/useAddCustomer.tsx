import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { ADD_CUSTOMERS } from '@/contacts/customers/graphql/mutations/addCustomers';
import { ICustomer } from '@/contacts/types/customerType';
import { recordTableCursorAtomFamily } from 'erxes-ui';
import { useIsCustomerLeadSessionKey } from '@/contacts/customers/hooks/useCustomerLeadSessionKey';
import { useSetAtom } from 'jotai';

// Not finished yet needs improvement
interface AddCustomerResult {
  customersAdd: ICustomer;
}

export function useAddCustomer() {
  const { sessionKey } = useIsCustomerLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const [customersAdd, { loading, error }] =
    useMutation<AddCustomerResult>(ADD_CUSTOMERS);

  const handleCustomersAdd = (
    options: MutationFunctionOptions<AddCustomerResult, any>,
  ) => {
    customersAdd({
      ...options,
      onCompleted: (data) => {
        setCursor('');
        options?.onCompleted?.(data);
      },
    });
  };
  return { customersAdd: handleCustomersAdd, loading, error };
}
