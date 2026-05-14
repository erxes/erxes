import { useToast } from 'erxes-ui';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { CREATE_CLIENT_PORTAL } from '@/client-portal/graphql/mutations/createClientPortal';

export const useCreateClientPortal = (
  options?: MutationFunctionOptions<{ createClientPortal: { _id: string } }>,
) => {
  const { toast } = useToast();
  const [clientPortalAdd, { loading, error }] = useMutation(
    CREATE_CLIENT_PORTAL,
    {
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    },
  );
  return { clientPortalAdd, loading, error };
};
