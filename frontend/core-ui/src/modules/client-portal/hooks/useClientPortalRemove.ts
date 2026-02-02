import { useMutation } from '@apollo/client';
import { GET_CLIENT_PORTALS } from '../graphql/queires/getClientPortals';
import { CLIENT_PORTAL_REMOVE } from '../graphql/mutations/clientPortalRemove';

export const useClientPortalRemove = () => {
  const [_removeClientPortal, { loading }] = useMutation(CLIENT_PORTAL_REMOVE);

  const removeClientPortal = async (clientPortalIds: string[]) => {
    await Promise.all(
      clientPortalIds.map((id) =>
        _removeClientPortal({
          variables: { id },
          refetchQueries: [GET_CLIENT_PORTALS],
        }),
      ),
    );
  };

  return { removeClientPortal, loading };
};
