import { CLIENT_PORTAL_UPDATE } from '../graphql/mutations/clientPortalUpdate';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { GET_CLIENT_PORTAL } from '../graphql/queires/getClientPortal';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useUpdateClientPortal = () => {
  const { t } = useTranslation('client-portal');
  const [updateClientPortal, { loading }] = useMutation(CLIENT_PORTAL_UPDATE);

  const handleUpdateClientPortal = (options: MutationFunctionOptions) => {
    updateClientPortal({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success', 'Success'),
          description: t('client-portal-updated-successfully', 'Client portal updated successfully'),
          variant: 'success',
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
