import { MutationHookOptions, useMutation } from '@apollo/client';
import { EDIT_CUSTOMERS } from '../graphql/mutations/editCustomers';
import { toast } from 'erxes-ui';
import { ICustomer } from '../types';

export const useCustomerEdit = () => {
  const [mutate, { loading }] = useMutation(EDIT_CUSTOMERS);

  const customerEdit = ({
    variables,
    onError,
    ...options
  }: MutationHookOptions<
    { customersEdit: { _id: string } },
    Partial<ICustomer>
  >) => {
    mutate({
      ...options,
      variables,
      update: (cache, { data: { customersEdit } }) => {
        cache.modify({
          id: cache.identify(customersEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field as keyof ICustomer];
              return fields;
            },
            {},
          ),
          optimistic: true,
        });
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { customerEdit, loading };
};
