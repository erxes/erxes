import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { useMultiQueryState } from 'erxes-ui';

/**
 * Agents shown in the settings list. The provider filter goes to the server;
 * the name search runs on the loaded page, which holds every agent.
 */
export const useAiAgentsList = () => {
  const [{ kind, searchValue }] = useMultiQueryState<{
    kind: string;
    searchValue: string;
  }>(['kind', 'searchValue']);
  const { automationsAiAgents, loading } = useAiAgents(kind);
  const query = searchValue?.trim().toLowerCase();

  const agents = query
    ? automationsAiAgents.filter((agent) =>
        agent.name?.toLowerCase().includes(query),
      )
    : automationsAiAgents;

  return { agents, totalCount: agents.length, loading, kind };
};
