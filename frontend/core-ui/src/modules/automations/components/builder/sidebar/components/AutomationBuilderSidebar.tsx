import { AutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebar';
import { AutomationBuilderSecondarySidebarToggle } from '@/automations/components/builder/sidebar/components/AutomationBuilderSecondarySidebarToggle';
import { AutomationActionContentSidebar } from '@/automations/components/builder/sidebar/components/content/action/AutomationActionContentSidebar';
import { AutomationTriggerContentSidebar } from '@/automations/components/builder/sidebar/components/content/trigger/components/AutomationTriggerContentSidebar';
import { AutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibrarySidebar';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationNodeType,
  AutomationsHotKeyScope,
  NodeData,
} from '@/automations/types';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import {
  Button,
  Card,
  cn,
  IconComponent,
  Separator,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { AutomationActionTargetSelector } from './content/action/AutomationActionTargetSelector';

export const AutomationBuilderSidebar = () => {
  const { awaitingToConnectNodeId } = useAutomation();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();

  const {
    isOpenSideBar,
    isSecondarySidebarOpen,
    activeNode,
    handleBack,
    handleClose,
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
    !!activeNode && activeNode.nodeType === AutomationNodeType.Action;
  const canShowSecondarySidebar = isEditingNode;
  const sidebarWidthClasses = hasSegmentFormContent
    ? 'w-screen max-w-full sm:w-fit sm:min-w-md sm:max-w-[min(56rem,calc(100vw-1rem))]'
    : 'w-screen max-w-full sm:w-fit sm:min-w-[28rem] sm:max-w-[min(42rem,calc(100vw-1rem))]';

  return (
    <AnimatePresence>
      {isOpenSideBar && (
        <div
          key="sidebar"
          className="absolute inset-y-0 right-0 z-50 flex max-w-full overflow-hidden sm:overflow-visible"
        >
          {isSecondarySidebarOpen && canShowSecondarySidebar ? (
            <AutomationBuilderSecondarySidebar />
          ) : null}

          <div
            className={cn(
              'flex h-full min-w-0 shrink-0 flex-col rounded-none border-l bg-sidebar',
              sidebarWidthClasses,
            )}
          >
            <AutomationBuilderSidebarHeader
              activeNode={activeNode}
              canShowSecondarySidebar={canShowSecondarySidebar}
              handleBack={handleBack}
              handleClose={handleClose}
            />

            <Card.Content className="min-w-0 flex-1 overflow-auto p-0">
              <AutomationBuilderSidebarContent activeNode={activeNode} />
            </Card.Content>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AutomationBuilderSidebarHeader = ({
  activeNode,
  canShowSecondarySidebar,
  handleClose,
  handleBack,
}: {
  activeNode?: NodeData;
  canShowSecondarySidebar: boolean;
  handleClose: () => void;
  handleBack: () => void;
}) => {
  if (!activeNode) {
    return null;
  }
  return (
    <>
      <Card.Header className="flex min-w-0 flex-row items-start justify-between gap-3 px-4 py-4 font-mono">
        <div className="flex min-w-0 flex-1 flex-row items-start gap-3">
          <div
            className={cn(
              'shrink-0 rounded-lg bg-primary/10 p-2 text-primary',
              {
                'bg-primary/10 text-primary':
                  activeNode.nodeType === AutomationNodeType.Trigger,
                'bg-success/10 text-success':
                  activeNode.nodeType === AutomationNodeType.Action,
                'bg-warning/10 text-warning':
                  activeNode.nodeType === AutomationNodeType.Workflow,
              },
            )}
          >
            <IconComponent className="size-6" name={activeNode.icon} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1 font-sans">
            <h2 className="w-full truncate text-xl font-semibold leading-none tracking-tight">
              {activeNode?.label || ''}
            </h2>
            <span className="w-full truncate text-sm font-normal text-muted-foreground">
              {activeNode?.description || ''}
            </span>
          </div>
        </div>
        <div className="mt-0 flex shrink-0 flex-row gap-2 self-start">
          {canShowSecondarySidebar ? (
            <AutomationBuilderSecondarySidebarToggle />
          ) : null}
          <Button size="icon" variant="secondary" onClick={handleBack}>
            <IconArrowLeft />
          </Button>
          <Button size="icon" variant="secondary" onClick={handleClose}>
            <IconX />
          </Button>
        </div>
      </Card.Header>
      <AutomationActionTargetSelector activeNode={activeNode} />
      <Separator />
    </>
  );
};

const AutomationBuilderSidebarContent = ({
  activeNode,
}: {
  activeNode?: NodeData;
}) => {
  if (activeNode) {
    const { nodeType } = activeNode || {};
    if (nodeType === AutomationNodeType.Trigger) {
      return <AutomationTriggerContentSidebar activeNode={activeNode} />;
    }

    if (nodeType === AutomationNodeType.Action) {
      return <AutomationActionContentSidebar />;
    }
  }

  return <AutomationNodeLibrarySidebar />;
};
