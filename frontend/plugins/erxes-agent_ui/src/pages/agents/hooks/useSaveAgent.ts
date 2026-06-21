import { ApolloCache, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { AgentFormValues } from '../validations';
import { agentMutationError } from './useAgentAccess';

const cacheUpdate = (cache: ApolloCache<unknown>) => {
  cache.evict({ fieldName: 'mastraAgentsMain' });
  cache.evict({ fieldName: 'mastraAgents' });
  cache.gc();
};

/** Create/update mutations for the agent form; navigates back on success. */
export const useSaveAgent = (id?: string) => {
  const navigate = useNavigate();
  const onCompleted = () => navigate('/settings/erxes-agent/agents');

  const [createAgent, { loading: creating }] = useMutation(MASTRA_AGENT_CREATE, {
    update: cacheUpdate,
    onCompleted,
    onError: agentMutationError('create'),
  });

  const [updateAgent, { loading: updating }] = useMutation(MASTRA_AGENT_UPDATE, {
    update: cacheUpdate,
    onCompleted,
    onError: agentMutationError('edit'),
  });

  const saveAgent = (doc: AgentFormValues) => {
    if (id) {
      updateAgent({ variables: { _id: id, doc } });
    } else {
      createAgent({ variables: { doc } });
    }
  };

  return { saveAgent, saving: creating || updating };
};
