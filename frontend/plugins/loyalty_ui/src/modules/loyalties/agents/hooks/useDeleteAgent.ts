import { useMutation, Reference } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DELETE_AGENT_MUTATION } from '../graphql/mutations/mutations';

const makeAgentsMainUpdater = (_id: string) => (existing: any, { readField }: { readField: (field: string, ref: any) => any }) => {
  const safeExisting = existing || {};
  const newList = (safeExisting.list || []).filter(
    (ref: Reference) => readField('_id', ref) !== _id,
  );
  return {
    ...safeExisting,
    list: newList,
    totalCount: Math.max((safeExisting.totalCount || 0) - 1, 0),
  };
};

export const useDeleteAgent = () => {
  const { toast } = useToast();

  const [deleteAgent, { loading, error }] = useMutation(DELETE_AGENT_MUTATION);

  const handleDeleteAgent = async (_id: string) => {
    return deleteAgent({
      variables: { _id },
      update(cache) {
        cache.modify({
          fields: {
            agentsMain: makeAgentsMainUpdater(_id),
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
