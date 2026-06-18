import { ApolloCache, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { toastError } from '~/lib/mutationToast';
import { AgentFormValues } from '../validations';

/** Create/update mutations for the agent form; navigates back on success. */
export const useSaveAgent = (id?: string) => {
  const navigate = useNavigate();

  const options = {
    // Invalidate every variable-keyed instance of the agent lists — the
    // paginated settings table (mastraAgentsMain) and the simple dropdown /
    // chat-sidebar list (mastraAgents). refetchQueries only refreshes one
    // exact-variable instance, so a searched or paged list would go stale.
    update: (cache: ApolloCache<unknown>) => {
      cache.evict({ fieldName: 'mastraAgentsMain' });
      cache.evict({ fieldName: 'mastraAgents' });
      cache.gc();
    },
    onCompleted: () => navigate('/settings/erxes-agent/agents'),
    onError: toastError('Save failed'),
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
