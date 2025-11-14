import { CLIENT_PORTAL_UPDATE } from '../graphql/mutations/clientPortalUpdate';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { GET_CLIENT_PORTAL } from '../graphql/queires/getClientPortal';
import { toast } from 'erxes-ui';

export const useUpdateClientPortal = () => {
  const [updateClientPortal, { loading }] = useMutation(CLIENT_PORTAL_UPDATE);

  const handleUpdateClientPortal = (options: MutationFunctionOptions) => {
    updateClientPortal({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Client portal updated successfully',
        });
        options.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: GET_CLIENT_PORTAL,
          variables: { _id: options.variables?.id },
        },
      ],
    });
  };
  return { updateClientPortal: handleUpdateClientPortal, loading };
};
