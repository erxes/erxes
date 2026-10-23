import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate, useParams } from 'react-router-dom';
import { SIDE_PANEL_CHAT_PATH, SIDE_PANEL_QUERY_KEY } from 'ui-modules';
import { agentSidePanelThreadRequestState } from '../states/agentPanelStates';

/** Old bookmarks continue in Assistant; no chat page is mounted here. */
export const LegacyAgentRedirect = () => {
  const { '*': legacyPath } = useParams();
  const requestThread = useSetAtom(agentSidePanelThreadRequestState);
  const navigate = useNavigate();
  useEffect(() => {
    requestThread(
      legacyPath &&
        legacyPath !== 'capabilities' &&
        /^[A-Za-z0-9_-]{1,64}$/.test(legacyPath)
        ? legacyPath
        : null,
    );
    navigate(
      {
        pathname: '/',
        search: new URLSearchParams({
          [SIDE_PANEL_QUERY_KEY]: SIDE_PANEL_CHAT_PATH,
        }).toString(),
      },
      { replace: true },
    );
  }, [legacyPath, navigate, requestThread]);
  return null;
};
