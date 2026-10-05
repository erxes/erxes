import { useNodeDropDownActions } from '@/automations/components/builder/nodes/hooks/useNodeDropDownActions';
import { NodeEditMetaDataForm } from '@/automations/components/builder/nodes/components/NodeEditMetaDataForm';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { NodeFrame } from '@/automations/components/builder/nodes/components/NodeFrame';
import { WorkflowActionMapper } from '@/automations/components/builder/nodes/components/WorkflowActionMapper';
import {
  WorkflowInputBindings,
  WorkflowInputsBadge,
} from '@/automations/components/builder/nodes/components/WorkflowInputBindings';
import {
  useWorkflowNodeContext,
  WorkflowNodeProvider,
} from '@/automations/context/WorkflowNodeProvider';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { NodeData, WorkflowNodeData } from '@/automations/types';
import { useConvertSelectionToWorkflow } from '@/automations/components/builder/hooks/useConvertSelectionToWorkflow';
import { useWorkflowTemplates } from '@/automations/components/builder/hooks/useWorkflowTemplates';
import {
  IconArrowBackUp,
  IconArrowsMaximize,
  IconArrowsSplit2,
  IconDots,
  IconEdit,
  IconTemplate,
  IconTrash,
} from '@tabler/icons-react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import {
  AlertDialog,
  Button,
  Card,
  cn,
  Dialog,
  DropdownMenu,
  IconComponent,
  Sheet,
} from 'erxes-ui';
import { memo, useCallback, useState } from 'react';

const WorkflowNodeContent = ({
  data,
  selected,
  id,
}: NodeProps<Node<NodeData & WorkflowNodeData>>) => {
  const {
    isOpenDialog,
    isOpenDropDown,
    isOpenRemoveAlert,
    setOpenRemoveAlert,
    setOpenDropDown,
    onRemoveNode,
    setOpenDialog,
  } = useNodeDropDownActions(id, data.nodeType);
  const { unconvertWorkflow } = useConvertSelectionToWorkflow();
  const { saveAsTemplate } = useWorkflowTemplates();
  const { setEditingWorkflowId } = useAutomation();
  const { workflows } = useAutomationNodes();
  const hasMemberActions = !!(workflows || []).find(
    (workflow) => workflow.id === id,
  )?.actions?.length;

  const handleUnconvertAndRemove = useCallback(() => {
    unconvertWorkflow(id);
    setOpenRemoveAlert(false);
  }, [unconvertWorkflow, id, setOpenRemoveAlert]);

  return (
    <NodeFrame
      label="Workflow"
      actions={
        <>
          {data.automationId ? (
            <WorkflowActionSelectorSheet data={data} />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingWorkflowId(id)}
            >
              <IconArrowsMaximize className="size-4" />
            </Button>
          )}
          <DropdownMenu open={isOpenDropDown} onOpenChange={setOpenDropDown}>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon">
                <IconDots className="size-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-42">
              <DropdownMenu.Item onSelect={() => setOpenDialog(true)}>
                <IconEdit className="size-4" />
                Edit
              </DropdownMenu.Item>
              {!data.automationId && hasMemberActions && (
                <>
                  <DropdownMenu.Item onSelect={() => unconvertWorkflow(id)}>
                    <IconArrowBackUp className="size-4" />
                    Convert back to actions
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => saveAsTemplate(id)}>
                    <IconTemplate className="size-4" />
                    Save as template
                  </DropdownMenu.Item>
                </>
              )}
              <DropdownMenu.Item
                className="text-destructive"
                onSelect={() => setOpenRemoveAlert(true)}
              >
                <IconTrash className="size-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>

          <Dialog open={isOpenDialog} onOpenChange={setOpenDialog}>
            <NodeEditMetaDataForm
              id={id}
              data={data}
              callback={() => setOpenDialog(false)}
            />
          </Dialog>
          <AlertDialog
            open={isOpenRemoveAlert}
            onOpenChange={setOpenRemoveAlert}
          >
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Delete workflow?</AlertDialog.Title>
                <AlertDialog.Description>
                  Delete the workflow together with its member actions, or
                  unconvert it to keep the member actions on the canvas.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action onClick={handleUnconvertAndRemove}>
                  Unconvert, keep actions
                </AlertDialog.Action>
                <AlertDialog.Action
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onRemoveNode}
                >
                  Delete workflow & actions
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </>
      }
      className={cn('animate-in fade-in zoom-in-95', {
        'ring-2 ring-info': selected,
        'ring-2 ring-destructive ring-offset-2': data?.error,
      })}
    >
      <div className="p-3 flex items-center border-b">
        <div className="flex min-w-0 items-center gap-2">
          <div className="size-7 shrink-0 rounded-md bg-info/10 text-info flex items-center justify-center">
            {data.icon ? (
              <IconComponent className="size-4" name={data.icon} />
            ) : (
              <IconArrowsSplit2 className="size-4" />
            )}
          </div>
          <p className="break-words text-sm font-semibold">{data.label}</p>
          <WorkflowInputsBadge />
        </div>
      </div>
      <div className="p-3">
        <span className="line-clamp-2 break-words text-xs text-accent-foreground">
          {data.description}
        </span>
        <WorkflowMemberSummary />
        <WorkflowInputBindings />
        {!!data.automationId && <WorkflowSelectedNodes {...data} />}
      </div>
      <Handle
        key="left"
        id="left"
        type="target"
        position={
          data.flowDirection === 'vertical' ? Position.Top : Position.Left
        }
        className={cn('!size-3 !border-2 !border-info !bg-background', {
          '!left-1/2 !top-0 -translate-x-1/2':
            data.flowDirection === 'vertical',
        })}
      />
    </NodeFrame>
  );
};

const WorkflowMemberSummary = () => {
  const { memberCount, entryLabel } = useWorkflowNodeContext();

  if (!memberCount) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-muted-foreground">
      {memberCount} action{memberCount > 1 ? 's' : ''}
      {entryLabel ? ` · entry: ${entryLabel}` : ''}
    </p>
  );
};

const WorkflowSelectedNodes = ({
  automationId,
  config = {},
  flowDirection,
}: any) => {
  const { selectedActionIds = [] } = config || {};
  const isVertical = flowDirection === 'vertical';

  return selectedActionIds.map((selectedActionId: string) => {
    return (
      <Card
        key={`workflow-${selectedActionId}-left`}
        className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono"
      >
        <Handle
          id={`workflow-${automationId}-${selectedActionId}-left`}
          key={`workflow-${automationId}-${selectedActionId}-left`}
          type="target"
          position={isVertical ? Position.Top : Position.Left}
          className={cn(
            '!size-4 !bg-background !border !border-2 !rounded-full !border-accent-foreground !z-4',
            isVertical ? '!left-1/2 !top-0 -translate-x-1/2' : '!left-4',
          )}
          isConnectable
          title="workflow-connect"
        />
        <div className="ml-6 text-muted-foreground">
          <p className="text-lg ">{selectedActionId}</p>
          <span className="text-base">{selectedActionId}</span>
        </div>
      </Card>
    );
  });
};

const WorkflowActionSelectorSheet = ({ data }: { data: WorkflowNodeData }) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconArrowsMaximize className="size-4" />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0 md:w-[calc(80vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>Workflow</Sheet.Title>
            <Sheet.Description>
              Select workflow action for connection
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          {open && <WorkflowActionMapper id={data.automationId} />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const WorkflowNode = (props: NodeProps<Node<NodeData & WorkflowNodeData>>) => (
  <WorkflowNodeProvider workflowId={props.id}>
    <WorkflowNodeContent {...props} />
  </WorkflowNodeProvider>
);

export default memo(WorkflowNode);
