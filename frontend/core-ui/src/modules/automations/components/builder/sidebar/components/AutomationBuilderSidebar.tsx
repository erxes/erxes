import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { AutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebar';
import { AutomationBuilderPrimarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderPrimarySidebar';
import { AutomationBuilderSidebarDock } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarDock';
import { useAutomationBuilderSecondaryPanels } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondaryPanels';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import {
  useAutomationVariableDragFeedback,
  VARIABLE_DROP_FEEDBACK_CLASS,
} from '@/automations/components/builder/sidebar/hooks/useAutomationVariableDragFeedback';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  cn,
  useIsMobile,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { AutomationVariableInsertionProvider } from 'ui-modules';
import { useTranslation } from 'react-i18next';
export const AutomationBuilderSidebar = () => {
  const { t } = useTranslation('automations');
  const isMobile = useIsMobile();
  const { awaitingToConnectNodeId } = useAutomation();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();
  const {
    isOpenSideBar,
    setIsOpenSideBar,
    activeNode,
    handleBack,
    handleClose,
    toggleSideBarOpen,
    canShowSecondarySidebar,
    sidebarWidthClasses,
  } = useAutomationBuilderSidebarHooks();
  const { activePanel, closePanel } = useAutomationBuilderSecondaryPanels();
  useAutomationVariableDragFeedback();
  useEffect(() => {
    if (!isOpenSideBar && awaitingToConnectNodeId) {
      toggleSideBarOpen();
    }
  }, [awaitingToConnectNodeId]);
  const onOpen = () => {
    toggleSideBarOpen();
    setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
  };
  const onClose = () => {
    if (isOpenSideBar) {
      setHotkeyScope(AutomationsHotKeyScope.Builder);
      toggleSideBarOpen();
    }
  };
  useScopedHotkeys(`mod+g`, () => onOpen(), AutomationsHotKeyScope.Builder);
  useScopedHotkeys(`mod+esc`, () => onClose(), AutomationsHotKeyScope.Builder);
  const pagePanel = usePagePanel({
    name: 'automations/builder/sidebar/AutomationBuilderSidebar',
    identity: activeNode?.id || 'library',
    open: isMobile && isOpenSideBar,
    onOpenChange: (open) => {
      if (!open) {
        handleClose();
      } else {
        setIsOpenSideBar(true);
      }
    },
  });
  if (!isOpenSideBar && !isMobile) {
    return null;
  }
  if (isMobile) {
    return (
      <AutomationVariableInsertionProvider>
        {createPortal(
          <div
            data-variable-drop-scope
            className="flex min-h-0 flex-1 flex-col overflow-hidden bg-sidebar"
          >
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <>
                <span className="sr-only">
                  {t('sidebar-automation-configuration')}
                </span>
                <p className="sr-only">
                  {t('sidebar-configure-selected-node')}
                </p>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div className="absolute inset-0">
                    <AutomationBuilderPrimarySidebar
                      activeNode={activeNode}
                      panelEntry={pagePanel}
                      showPanelToggles={canShowSecondarySidebar}
                      className="w-full border-l-0"
                      handleBack={handleBack}
                      handleClose={handleClose}
                    />
                  </div>

                  {activePanel && canShowSecondarySidebar ? (
                    <div className="absolute inset-x-0 bottom-0 z-20 h-1/3 min-h-72 animate-in overflow-hidden rounded-t-xl border-t bg-sidebar shadow-xl slide-in-from-bottom-4 mx-2">
                      <AutomationBuilderSecondarySidebar
                        panel={activePanel}
                        className="h-full w-full border-l-0"
                        handleClose={closePanel}
                      />
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <PagePanelStatus entry={pagePanel} />
            )}
          </div>,
          pagePanel,
        )}
      </AutomationVariableInsertionProvider>
    );
  }
  return (
    <AutomationVariableInsertionProvider>
      <AnimatePresence>
        <div
          key="sidebar"
          data-variable-drop-scope
          className={cn(
            'flex h-full min-h-0 max-w-full shrink-0 flex-row overflow-hidden',
            VARIABLE_DROP_FEEDBACK_CLASS,
          )}
        >
          {activePanel && canShowSecondarySidebar ? (
            <AutomationBuilderSecondarySidebar panel={activePanel} />
          ) : null}

          {canShowSecondarySidebar && <AutomationBuilderSidebarDock />}

          <AutomationBuilderPrimarySidebar
            activeNode={activeNode}
            showPanelToggles={false}
            className={sidebarWidthClasses}
            handleBack={handleBack}
            handleClose={handleClose}
          />
        </div>
      </AnimatePresence>
    </AutomationVariableInsertionProvider>
  );
};
