import { useMutation, Reference } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DELETE_AGENT_MUTATION } from '../graphql/mutations/mutations';

export const useDeleteAgent = () => {
  const { toast } = useToast();

  const [deleteAgent, { loading, error }] = useMutation(DELETE_AGENT_MUTATION);

  const handleDeleteAgent = async (_id: string) => {
    return deleteAgent({
      variables: { _id },
      update(cache) {
        cache.modify({
          fields: {
            agentsMain(existing = {}, { readField }) {
              const newList = (existing.list || []).filter(
                (ref: Reference) => readField('_id', ref) !== _id,
              );
              return {
                ...existing,
                list: newList,
                totalCount: Math.max((existing.totalCount || 0) - 1, 0),
              };
            },
          },
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Agent deleted successfully',
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

  return { deleteAgent: handleDeleteAgent, loading, error };
};
