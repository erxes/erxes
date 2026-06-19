import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { AgentFormValues } from '~/pages/agents/validations';

/**
 * Inline agent update for the in-chat "Edit agent" modal. Unlike useSaveAgent
 * (which navigates back to the settings list on success), this stays put and
 * refetches the chat rail's agent list so the change shows immediately.
 */
export const useUpdateAgent = (id: string, onCompleted?: () => void) => {
  const [updateAgent, { loading }] = useMutation(MASTRA_AGENT_UPDATE, {
    refetchQueries: [{ query: MASTRA_AGENTS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: 'Agent updated' });
      onCompleted?.();
    },
    onError: (error) =>
      toast({
        title: 'Could not update agent',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const saveAgent = (doc: AgentFormValues) =>
    updateAgent({ variables: { _id: id, doc } });

  return { saveAgent, saving: loading };
};
