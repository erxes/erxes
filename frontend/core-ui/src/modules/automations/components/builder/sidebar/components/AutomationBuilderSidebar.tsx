import { AutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebar';
import { AutomationBuilderPrimarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderPrimarySidebar';
import { AutomationBuilderSidebarDock } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarDock';
import { useAutomationBuilderSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebar';
import { VARIABLE_DROP_FEEDBACK_CLASS } from '@/automations/components/builder/sidebar/hooks/useAutomationVariableDragFeedback';
import { cn, Sheet } from 'erxes-ui';
import { AnimatePresence } from 'framer-motion';
import { AutomationVariableInsertionProvider } from 'ui-modules';
import { useTranslation } from 'react-i18next';
export const AutomationBuilderSidebar = () => {
  const { t } = useTranslation('automations');
  const {
    isMobile,
    isOpenSideBar,
    activeNode,
    handleBack,
    handleClose,
    canShowSecondarySidebar,
    sidebarWidthClasses,
    activePanel,
    closePanel,
    onSheetOpenChange,
  } = useAutomationBuilderSidebar();
  if (!isOpenSideBar) {
    return null;
  }
  if (isMobile) {
    return (
      <AutomationVariableInsertionProvider>
        <Sheet open={isOpenSideBar} onOpenChange={onSheetOpenChange}>
          <Sheet.View
            side="right"
            data-variable-drop-scope
            className={cn(
              'max-w-none bg-sidebar p-0 sm:max-w-2xl',
              VARIABLE_DROP_FEEDBACK_CLASS,
            )}
          >
            <Sheet.Title className="sr-only">
              {t('sidebar-automation-configuration')}
            </Sheet.Title>
            <Sheet.Description className="sr-only">
              {t('sidebar-configure-selected-node')}
            </Sheet.Description>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div className="absolute inset-0">
                <AutomationBuilderPrimarySidebar
                  activeNode={activeNode}
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
          </Sheet.View>
        </Sheet>
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
