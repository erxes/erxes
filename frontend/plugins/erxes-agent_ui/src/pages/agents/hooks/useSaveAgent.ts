import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { AgentFormValues } from '../validations';

/** Create/update mutations for the agent form; navigates back on success. */
export const useSaveAgent = (id?: string) => {
  const navigate = useNavigate();

  const options = {
    refetchQueries: [{ query: MASTRA_AGENTS }],
    awaitRefetchQueries: true,
    onCompleted: () => navigate('/settings/erxes-agent/agents'),
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
