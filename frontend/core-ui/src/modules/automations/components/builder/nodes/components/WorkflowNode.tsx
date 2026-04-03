import { useNodeDropDownActions } from '@/automations/components/builder/nodes/hooks/useNodeDropDownActions';
import { NodeRemoveActionDialog } from '@/automations/components/builder/nodes/components/NodeDropdownActions';
import { NodeOutputHandler } from '@/automations/components/builder/nodes/components/NodeOutputHandler';
import { WorkflowActionMapper } from '@/automations/components/builder/nodes/components/WorkflowActionMapper';
import {
  AutomationNodeType,
  NodeData,
  WorkflowNodeData,
} from '@/automations/types';
import {
  IconArrowsMaximize,
  IconArrowsSplit2,
  IconDotsVertical,
} from '@tabler/icons-react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { Button, Card, cn, DropdownMenu, Sheet } from 'erxes-ui';
import { memo, useState } from 'react';

const WorkflowNode = ({
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
  } = useNodeDropDownActions(id, data.nodeType);

  return (
    <div className="flex flex-col">
      <div className="w-2/5 ml-1 bg-warning/10 text-warning text-center px-2 py-1 rounded-t-md">
        <p className="font-medium font-bold">Workflow</p>
      </div>
      <div
        className={cn(
          'rounded-md shadow-md bg-background w-[280px] relative font-mono transition-all duration-200',
          {
            'ring-2 ring-warning': selected,
            'ring-2 ring-red-300 ring-offset-2': data?.error,
          },
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-slate-200 gap-8">
          <div className="flex items-center gap-2 text-warning">
            <div className="size-6 rounded-full flex items-center justify-center">
              <IconArrowsSplit2 />
            </div>
            <p className="font-medium">{data.label}</p>
          </div>

          <div className="flex items-center gap-1">
            <WorkflowActionSelectorSheet data={data} />
            <DropdownMenu
              open={isOpenDropDown || isOpenDialog || isOpenRemoveAlert}
              onOpenChange={(open) => {
                if (!isOpenDialog || !isOpenRemoveAlert) {
                  setOpenDropDown(open);
                }
              }}
            >
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-42">
                <DropdownMenu.Item asChild>
                  <NodeRemoveActionDialog
                    onRemoveNode={onRemoveNode}
                    isOpenRemoveAlert={isOpenRemoveAlert}
                    setOpenRemoveAlert={setOpenRemoveAlert}
                  />
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-3">
          <span className="text-xs text-accent-foreground ">
            {data.description}
          </span>
          <WorkflowSelectedNodes {...data} />
        </div>
        <NodeOutputHandler
          nodeType={AutomationNodeType.Workflow}
          handlerId={id}
          className="!bg-warning"
          addButtonClassName="hover:border-warning hover:text-warning "
          showAddButton={false}
        />
      </div>
    </div>
  );
};

const WorkflowSelectedNodes = ({ automationId, config = {} }: any) => {
  const { selectedActionIds = [] } = config || {};

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
          position={Position.Left}
          className={
            '!left-4 !size-4 !bg-background !border !border-2 !rounded-full !border-accent-foreground !z-4'
          }
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
        <Button variant="ghost" size="sm" className="w-full justify-start">
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

export default memo(WorkflowNode);
