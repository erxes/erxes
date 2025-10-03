import { useMutation } from '@apollo/client';
import { ADD_INTEGRATION } from '../graphql/mutations/AddIntegration';
import { toast } from 'erxes-ui';

export const useIntegrationAdd = () => {
  const [addIntegration, { loading }] = useMutation(ADD_INTEGRATION, {
    refetchQueries: ['Integrations'],
    onCompleted() {
      toast({
        title: 'Integration added',
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: 'Failed to add integration',
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  return {
    addIntegration,
    loading,
  };
};
