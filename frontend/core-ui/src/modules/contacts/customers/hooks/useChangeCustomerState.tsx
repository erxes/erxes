import { useMutation } from '@apollo/client';
import { CUSTOMERS_CHANGE_STATE_BULK } from '@/contacts/customers/graphql/mutations/changeStateBulk';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { useCustomersVariables } from '@/contacts/customers/hooks/useCustomers';

export const useChangeCustomerState = () => {
  const customersQueryVariables = useCustomersVariables();

  const [_changeStateBulk, { loading }] = useMutation(
    CUSTOMERS_CHANGE_STATE_BULK,
  );

  const changeCustomerState = async (
    _ids: string[],
    value: string,
    options?: object,
  ) => {
    await _changeStateBulk({
      ...options,
      variables: { _ids, value },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GET_CUSTOMERS,
            variables: customersQueryVariables,
          },
          (data) => {
            if (!data) return;
            const { customers } = data;

            // If filtering by a specific state, remove customers that no longer match
            const currentType = customersQueryVariables?.type;
            if (currentType && currentType !== value) {
              const updatedList = customers.list.filter(
                (c: { _id: string }) => !_ids.includes(c._id),
              );
              return {
                customers: {
                  ...customers,
                  list: updatedList,
                  totalCount: customers.totalCount - _ids.length,
                },
              };
            }

            const updatedList = customers.list.map(
              (c: { _id: string; state?: string }) =>
                _ids.includes(c._id) ? { ...c, state: value } : c,
            );
            return { customers: { ...customers, list: updatedList } };
          },
        );
      },
    });
  };

  return { changeCustomerState, loading };
};
