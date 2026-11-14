import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalSidebar } from '@/global-sidebar/hooks/useGlobalSidebar';
import { agentSidePanelThreadRequestState } from '../states/agentPanelStates';

/** Old bookmarks continue in Assistant; no chat page is mounted here. */
export const LegacyAgentRedirect = () => {
  const { '*': legacyPath } = useParams();
  const requestThread = useSetAtom(agentSidePanelThreadRequestState);
  const navigate = useNavigate();
  const { openTool } = useGlobalSidebar();
  useEffect(() => {
    requestThread(
      legacyPath &&
        legacyPath !== 'capabilities' &&
        /^[A-Za-z0-9_-]{1,64}$/.test(legacyPath)
        ? legacyPath
        : null,
    );
    openTool('assistant');
    navigate('/', { replace: true });
  }, [legacyPath, navigate, openTool, requestThread]);
  return null;
};
