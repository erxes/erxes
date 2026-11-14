import { useAtom } from 'jotai';
import { useCallback } from 'react';
import {
  GlobalSidebarTool,
  globalSidebarToolState,
} from '@/global-sidebar/states/globalSidebarState';

/** Opens, closes and toggles the single tool shown in the global sidebar. */
export const useGlobalSidebar = () => {
  const [tool, setTool] = useAtom(globalSidebarToolState);

  const openTool = useCallback(
    (next: GlobalSidebarTool) => setTool(next),
    [setTool],
  );
  const close = useCallback(() => setTool(null), [setTool]);
  const toggleTool = useCallback(
    (next: GlobalSidebarTool) =>
      setTool((current) => (current === next ? null : next)),
    [setTool],
  );

  return { tool, openTool, close, toggleTool };
};
