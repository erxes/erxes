import { useMutation } from '@apollo/client';
import { ADD_ACTIVE_SESSION } from '@/integrations/call/graphql/mutations/callMutations';
import { toast } from 'erxes-ui';

export const useCallCreateSession = () => {
  const [createActiveSession, { loading }] = useMutation(ADD_ACTIVE_SESSION, {
    onError: (e) => {
      toast({
        title: 'Uh oh! Something went wrong while creating session',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createActiveSession,
    loading,
  };
};
