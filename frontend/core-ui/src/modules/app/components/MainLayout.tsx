import { NavigationActivityRail } from '@/navigation/components/NavigationActivityRail';
import { NavigationContextPanel } from '@/navigation/components/NavigationContextPanel';
import { NavigationTabStrip } from '@/navigation/components/NavigationTabStrip';
import { useNavigationTabs } from '@/navigation/hooks/useNavigationTabs';
import { navigationPanelOpenState } from '@/navigation/states/navigationShellState';
import { FloatingWidgets } from '@/widgets/components/FloatingWidgets';
import { Sidebar, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

const PREVIEW_DISMISS_DELAY = 180;

export const DefaultLayout = () => {
  const location = useLocation();
  const isSettings = location.pathname.includes('/settings');
  const [inPreview] = useQueryState<boolean>('inPreview');
  const [isPanelOpen, setPanelOpen] = useAtom(navigationPanelOpenState);
  const { openTab } = useNavigationTabs();
  const [previewPluginId, setPreviewPluginId] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPreviewTimer = useCallback(() => {
    if (!previewTimerRef.current) {
      return;
    }

    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
  }, []);

  const clearPreview = useCallback(() => {
    clearPreviewTimer();
    setPreviewPluginId(null);
  }, [clearPreviewTimer]);

  const handleOpenPlugin = useCallback(
    (pluginId: string) => {
      clearPreview();
      openTab(pluginId);
      setPanelOpen(true);
    },
    [clearPreview, openTab, setPanelOpen],
  );

  const handlePreviewStart = useCallback(
    (pluginId: string) => {
      clearPreviewTimer();

      if (!isPanelOpen && !isSettings) {
        setPreviewPluginId(pluginId);
      }
    },
    [clearPreviewTimer, isPanelOpen, isSettings],
  );

  const handlePreviewEnd = useCallback(() => {
    clearPreviewTimer();
    previewTimerRef.current = setTimeout(() => {
      setPreviewPluginId(null);
      previewTimerRef.current = null;
    }, PREVIEW_DISMISS_DELAY);
  }, [clearPreviewTimer]);

  const handleTogglePanel = useCallback(() => {
    clearPreview();
    setPanelOpen((open) => !open);
  }, [clearPreview, setPanelOpen]);

  const handlePreviewActivate = useCallback(() => {
    if (previewPluginId) {
      handleOpenPlugin(previewPluginId);
    }
  }, [handleOpenPlugin, previewPluginId]);

  useEffect(
    () => () => {
      clearPreviewTimer();
    },
    [clearPreviewTimer],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();
        handleTogglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePanel]);

  if (inPreview) {
    return <Outlet />;
  }

  return (
    <Sidebar.Provider className="h-screen w-screen flex-col">
      <NavigationTabStrip
        onOpenPlugin={handleOpenPlugin}
        onTogglePanel={handleTogglePanel}
      />
      <div className="relative flex min-h-0 flex-1">
        <NavigationActivityRail
          onOpenPlugin={handleOpenPlugin}
          onPreviewEnd={handlePreviewEnd}
          onPreviewStart={handlePreviewStart}
        />
        <NavigationContextPanel
          isOpen={isPanelOpen}
          isSettings={isSettings}
          onCollapse={handleTogglePanel}
          onPreviewActivate={handlePreviewActivate}
          onPreviewEnd={handlePreviewEnd}
          onPreviewEnter={clearPreviewTimer}
          previewPluginId={previewPluginId}
        />
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <FloatingWidgets />
          <Outlet />
        </main>
      </div>
    </Sidebar.Provider>
  );
};
