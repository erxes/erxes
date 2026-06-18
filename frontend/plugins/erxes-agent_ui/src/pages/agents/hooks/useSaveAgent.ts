import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'erxes-ui';
import { MASTRA_AGENTS, MASTRA_AGENTS_MAIN } from '~/graphql/queries';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { AGENTS_PER_PAGE } from '../useMastraAgentList';
import { AgentFormValues } from '../validations';

/** Create/update mutations for the agent form; navigates back on success. */
export const useSaveAgent = (id?: string) => {
  const navigate = useNavigate();

  const options = {
    // Refresh the paginated settings list (MASTRA_AGENTS_MAIN, with the same
    // variables the list mounts with) plus MASTRA_AGENTS, which the agent
    // dropdown and chat sidebar read.
    refetchQueries: [
      {
        query: MASTRA_AGENTS_MAIN,
        variables: {
          page: 1,
          perPage: AGENTS_PER_PAGE,
          searchValue: undefined,
        },
      },
      { query: MASTRA_AGENTS },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => navigate('/settings/erxes-agent/agents'),
    onError: (e: Error) =>
      toast({
        title: 'Save failed',
        description: e.message,
        variant: 'destructive',
      }),
  };

  const [createAgent, { loading: creating }] = useMutation(
    MASTRA_AGENT_CREATE,
    options,
  );
  const [updateAgent, { loading: updating }] = useMutation(
    MASTRA_AGENT_UPDATE,
    options,
  );

  const saveAgent = (doc: AgentFormValues) => {
    if (id) {
      updateAgent({ variables: { _id: id, doc } });
    } else {
      createAgent({ variables: { doc } });
    }
  };

  return { saveAgent, saving: creating || updating };
};
