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
  const sidebarWidthClasses = hasSegmentFormContent
    ? 'min-w-md max-w-4xl w-fit'
    : 'min-w-80 max-w-2xl w-fit';

  return (
    <AnimatePresence>
      {isOpenSideBar && (
        <div
          key="sidebar"
          className={cn(
            'absolute right-0 top-0 h-full bg-sidebar rounded-none flex flex-col z-50 border-l',
            sidebarWidthClasses,
          )}
        >
          <AutomationBuilderSidebarHeader
            activeNode={activeNode}
            handleBack={handleBack}
            handleClose={handleClose}
            wide={hasSegmentFormContent}
          />

          <Card.Content
            className={cn(
              'w-full flex-1 overflow-auto p-0',
              hasSegmentFormContent
                ? 'min-w-md max-w-4xl'
                : 'min-w-80 max-w-2xl',
            )}
          >
            <AutomationBuilderSidebarContent activeNode={activeNode} />
          </Card.Content>
        </div>
      )}
    </AnimatePresence>
  );
};

const AutomationBuilderSidebarHeader = ({
  activeNode,
  handleClose,
  handleBack,
  wide = false,
}: {
  activeNode?: NodeData;
  handleClose: () => void;
  handleBack: () => void;
  wide?: boolean;
}) => {
  if (!activeNode) {
    return null;
  }
  return (
    <>
      <Card.Header
        className={cn(
          'font-mono flex flex-row justify-between items-center pl-2 py-4 pr-6',
          wide ? 'min-w-md max-w-4xl' : 'min-w-80 max-w-2xl',
        )}
      >
        <div className="flex flex-row items-start pl-2">
          <div
            className={cn('bg-primary/10 text-primary rounded-lg p-2', {
              'bg-primary/10 text-primary':
                activeNode.nodeType === AutomationNodeType.Trigger,
              'bg-success/10 text-success':
                activeNode.nodeType === AutomationNodeType.Action,
              'bg-warning/10 text-warning':
                activeNode.nodeType === AutomationNodeType.Workflow,
            })}
          >
            <IconComponent className="size-6" name={activeNode.icon} />
          </div>

          <div
            className={cn(
              'px-6 flex flex-col gap-1 font-sans',
              wide ? 'min-w-md max-w-4xl' : 'min-w-80 max-w-96',
            )}
          >
            <h2 className="font-semibold leading-none tracking-tight text-xl w-full">
              {activeNode?.label || ''}
            </h2>
            <span className="text-sm text-muted-foreground font-normal w-full">
              {activeNode?.description || ''}
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-2 self-start mt-0">
          <Button size="icon" variant="ghost" onClick={handleBack}>
            <IconArrowLeft />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleClose}>
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
