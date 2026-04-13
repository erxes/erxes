import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { REMOVE_TEAM } from '../graphql/mutations/removeTeam';

export const useRemoveTeam = () => {
  const { toast } = useToast();
  const [_removeTeam, { loading, error }] = useMutation(REMOVE_TEAM);
  const removeTeam = (options: MutationHookOptions) => {
    return _removeTeam({
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { removeTeam, loading, error };
};
