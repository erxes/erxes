import { useLocation } from 'react-router';
import { AgentPath } from '~/modules/loyalties/agents/types/path/Agent';
import { AGENT_CURSOR_SESSION_KEY } from '../constants/agentCursorSessionKey';

export const useAgentLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isAgent = pathname.includes(AgentPath.Index);

  return {
    isAgent,
    sessionKey: AGENT_CURSOR_SESSION_KEY,
  };
};
