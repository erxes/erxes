import { OperationVariables, useMutation } from '@apollo/client';
import { ICustomer } from 'ui-modules';
import { useClientPortalUsers } from './useClientPortalUsers';
import { CP_USERS_REMOVE } from '../graphql/cpUsersRemove';
import { GET_CLIENT_PORTAL_USERS } from '../graphql/getClientPortalUsers';

export const useRemoveCpUsers = () => {
  const { filter } = useClientPortalUsers();
  const [_removeCpUsers, { loading }] = useMutation(CP_USERS_REMOVE);

  const removeCpUsers = async (
    customerIds: string[],
    options?: OperationVariables,
  ) => {
    await Promise.all(
      customerIds.map((_id) =>
        _removeCpUsers({
          ...options,
          variables: { _id, ...options?.variables },
          update: (cache) => {
            cache.updateQuery(
              {
                query: GET_CLIENT_PORTAL_USERS,
                variables: { filter },
              },
              (data) => {
                if (!data?.customers) return;

                const { customers } = data;
                const updatedList = customers.list.filter(
                  (customer: ICustomer) => customer._id !== _id,
                );

                return {
                  customers: {
                    ...customers,
                    list: updatedList,
                    totalCount: customers.totalCount - 1,
                  },
                };
              },
            );
          },
        }),
      ),
    );
  };

  return { removeCpUsers, loading };
};
