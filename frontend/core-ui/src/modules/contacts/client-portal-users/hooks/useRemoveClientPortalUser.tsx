import { OperationVariables, useMutation } from '@apollo/client';
import { ICustomer } from 'ui-modules';
import { useClientPortalUsers } from './useClientPortalUsers';
import { CP_USERS_REMOVE } from '../graphql/cpUsersRemove';
import { GET_CLIENT_PORTAL_USERS } from '../graphql/getClientPortalUsers';

export const useRemoveCpUsers = () => {
  const cpUsersQueryVariables = useClientPortalUsers();
  const [_removeCpUsers, { loading }] = useMutation(CP_USERS_REMOVE);

  const removeCpUsers = async (
    customerIds: string[],
    options?: OperationVariables,
  ) => {
    await _removeCpUsers({
      ...options,
      variables: { customerIds, ...options?.variables },
      update: (cache) => {
        cache.updateQuery(
          {
            query: GET_CLIENT_PORTAL_USERS,
            variables: cpUsersQueryVariables,
          },
          (data) => {
            if (!data) return;
            const { customers } = data;
            const updatedCpUsers = customers.list.filter(
              (customer: ICustomer) => !customerIds.includes(customer._id),
            );

            return {
              customers: {
                ...customers,
                list: updatedCpUsers,
                totalCount: customers.totalCount - customerIds.length,
              },
            };
          },
        );
      },
    });
  };

  return { removeCpUsers, loading };
};
