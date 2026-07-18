import { AutomationBuilderNodeMetaEditor } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeMetaEditor';
import { AutomationBuilderSidebarHeaderActions } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarHeaderActions';
import { AutomationActionContentSidebar } from '@/automations/components/builder/sidebar/components/content/action/AutomationActionContentSidebar';
import { AutomationActionTargetSelector } from '@/automations/components/builder/sidebar/components/content/action/AutomationActionTargetSelector';
import { AutomationTriggerContentSidebar } from '@/automations/components/builder/sidebar/components/content/trigger/components/AutomationTriggerContentSidebar';
import { AutomationWorkflowContentSidebar } from '@/automations/components/builder/sidebar/components/content/workflow/AutomationWorkflowContentSidebar';
import { AutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/components/library/AutomationNodeLibrarySidebar';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Card, IconComponent, Separator, cn } from 'erxes-ui';

export const AutomationBuilderPrimarySidebar = ({
  activeNode,
  canShowSecondarySidebar,
  className,
  handleBack,
  handleClose,
}: {
  activeNode?: NodeData;
  canShowSecondarySidebar: boolean;
  className?: string;
  handleBack: () => void;
  handleClose: () => void;
}) => {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 shrink-0 flex-col rounded-none border-l bg-sidebar',
        className,
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
                'bg-info/10 text-info':
                  activeNode.nodeType === AutomationNodeType.Workflow,
              },
            )}
          >
            <IconComponent className="size-6" name={activeNode.icon} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1 font-sans">
            <AutomationBuilderNodeMetaEditor activeNode={activeNode} />
          </div>
        </div>
        <AutomationBuilderSidebarHeaderActions
          canShowSecondarySidebar={canShowSecondarySidebar}
          handleBack={handleBack}
          handleClose={handleClose}
        />
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
  if (activeNode?.nodeType === AutomationNodeType.Trigger) {
    return <AutomationTriggerContentSidebar activeNode={activeNode} />;
  }

  if (activeNode?.nodeType === AutomationNodeType.Action) {
    return <AutomationActionContentSidebar />;
  }

  if (activeNode?.nodeType === AutomationNodeType.Workflow) {
    return <AutomationWorkflowContentSidebar />;
  }

  return <AutomationNodeLibrarySidebar />;
};
