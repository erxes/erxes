import { OperationVariables, useMutation } from '@apollo/client';
import { CUSTOMERS_REMOVE } from '@/contacts/customers/graphql/mutations/removeCustomers';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { ICustomer } from 'ui-modules';
import { useCustomersVariables } from '@/contacts/customers/hooks/useCustomers';

export const useRemoveCustomers = () => {
  const { customersQueryVariables } = useCustomersVariables();
  const [_removeCustomers, { loading }] = useMutation(CUSTOMERS_REMOVE);

  const removeCustomers = async (
    customerIds: string[],
    options?: OperationVariables,
  ) => {
    await _removeCustomers({
      ...options,
      variables: { customerIds, ...options?.variables },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GET_CUSTOMERS,
            variables: customersQueryVariables,
          },
          ({ customers }) => {
            const updatedCustomers = customers.list.filter(
              (customer: ICustomer) =>
                !options?.variables?.customerIds.includes(customer._id),
            );

            return {
              customers: {
                ...customers,
                list: updatedCustomers,
                totalCount: customers.totalCount - customerIds.length,
              },
            };
          },
        );
      },
    });
  };

  return { removeCustomers, loading };
};
