import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { AGENTS_EDIT_MUTATION } from '../graphql/mutations/mutations';
import { IAgent } from '../types/agent';

export const useEditAgent = () => {
  const { toast } = useToast();

  // Apollo automatically normalizes by _id, so returning all fields
  // from the mutation is enough to update the cache in-place.
  const [editAgent, { loading, error }] = useMutation(AGENTS_EDIT_MUTATION);

  const agentEdit = async (variables: IAgent) => {
    return editAgent({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Agent updated successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { agentEdit, loading, error };
};
