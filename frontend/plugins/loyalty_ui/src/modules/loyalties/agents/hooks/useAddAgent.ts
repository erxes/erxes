import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { AGENTS_ADD_MUTATION } from '../graphql/mutations/mutations';
import { IAgent } from '../types/agent';

export const useAddAgent = () => {
  const { toast } = useToast();

  const [addAgent, { loading, error }] = useMutation(AGENTS_ADD_MUTATION);

  const agentAdd = async (variables: Omit<IAgent, '_id'>) => {
    return addAgent({
      variables,
      update(cache, { data }) {
        const newAgent = data?.agentsAdd;
        if (!newAgent) return;

        cache.modify({
          fields: {
            agentsMain(existing = {}) {
              return {
                ...existing,
                list: [newAgent, ...(existing.list || [])],
                totalCount: (existing.totalCount || 0) + 1,
              };
            },
          },
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Agent created successfully',
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

  return { agentAdd, loading, error };
};
