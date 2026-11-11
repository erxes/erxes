import { useEffect } from 'react';
import { SIDE_PANEL_CHAT_PATH, useSidePanel } from 'ui-modules';
import { AssistantPanel } from '@/side-panel/components/chat/AssistantPanel';
import { useGlobalSidebar } from '@/global-sidebar/hooks/useGlobalSidebar';

/**
 * The right-most column for workspace-wide tools. Unlike the record panel it
 * does not follow the page or app tab; it stays until the user closes it.
 */
export const GlobalSidebar = () => {
  const { path, dismissPath } = useSidePanel();
  const { openTool } = useGlobalSidebar();

  // Old `?panel=/chat` links (bookmarks, legacy redirect) open Assistant here.
  useEffect(() => {
    if (path === SIDE_PANEL_CHAT_PATH) {
      openTool('assistant');
      dismissPath(SIDE_PANEL_CHAT_PATH);
    }
  }, [path, dismissPath, openTool]);

  return <AssistantPanel />;
};
