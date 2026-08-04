import { AutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebar';
import { AutomationBuilderPrimarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderPrimarySidebar';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationNodeType,
  AutomationsHotKeyScope,
} from '@/automations/types';
import {
  Sheet,
  useIsMobile,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { AutomationVariableInsertionProvider } from 'ui-modules';

export const AutomationBuilderSidebar = () => {
  const isMobile = useIsMobile();
  const { awaitingToConnectNodeId } = useAutomation();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();

  const {
    isOpenSideBar,
    isSecondarySidebarOpen,
    activeNode,
    handleBack,
    handleClose,
    toggleSecondarySidebarOpen,
    toggleSideBarOpen,
  } = useAutomationBuilderSidebarHooks();

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

  const hasSegmentFormContent =
    activeNode?.nodeType === AutomationNodeType.Trigger &&
    !activeNode?.isCustom;
  const isEditingNode =
    !!activeNode &&
    (activeNode.nodeType === AutomationNodeType.Action ||
      activeNode.nodeType === AutomationNodeType.Workflow);
  const canShowSecondarySidebar = isEditingNode;
  const sidebarWidthClasses = hasSegmentFormContent
    ? 'w-screen max-w-full sm:w-fit sm:min-w-md sm:max-w-[min(56rem,calc(100vw-1rem))]'
    : 'w-screen max-w-full sm:w-fit sm:min-w-[28rem] sm:max-w-[min(42rem,calc(100vw-1rem))]';

  if (!isOpenSideBar) {
    return null;
  }

  if (isMobile) {
    return (
      <AutomationVariableInsertionProvider>
        <Sheet
          open={isOpenSideBar}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
        >
          <Sheet.View
            side="right"
            className="max-w-none bg-sidebar p-0 sm:max-w-2xl"
          >
            <Sheet.Title className="sr-only">
              Automation configuration
            </Sheet.Title>
            <Sheet.Description className="sr-only">
              Configure the selected automation node
            </Sheet.Description>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div className="absolute inset-0">
                <AutomationBuilderPrimarySidebar
                  activeNode={activeNode}
                  canShowSecondarySidebar={canShowSecondarySidebar}
                  className="w-full border-l-0"
                  handleBack={handleBack}
                  handleClose={handleClose}
                />
              </div>

              {isSecondarySidebarOpen && canShowSecondarySidebar ? (
                <div className="absolute inset-x-0 bottom-0 z-20 h-1/3 min-h-72 animate-in overflow-hidden rounded-t-xl border-t bg-sidebar shadow-xl slide-in-from-bottom-4 mx-2">
                  <AutomationBuilderSecondarySidebar
                    className="h-full w-full border-l-0"
                    handleClose={toggleSecondarySidebarOpen}
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
          className="flex h-full min-h-0 max-w-full shrink-0 flex-row overflow-hidden"
        >
          {isSecondarySidebarOpen && canShowSecondarySidebar ? (
            <AutomationBuilderSecondarySidebar />
          ) : null}

          <AutomationBuilderPrimarySidebar
            activeNode={activeNode}
            canShowSecondarySidebar={canShowSecondarySidebar}
            className={sidebarWidthClasses}
            handleBack={handleBack}
            handleClose={handleClose}
          />
        </div>
      </AnimatePresence>
    </AutomationVariableInsertionProvider>
  );
};
