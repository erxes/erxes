import PrimaryEdge from '@/automations/components/builder/edges/PrimaryEdge';
import ActionNode from '@/automations/components/builder/nodes/components/ActionNode';
import { useActionsWorkflowNode } from '@/automations/components/builder/nodes/hooks/useActionsWorkflowNode';
import { useAutomationWorkflowActionMapper } from '@/automations/components/builder/nodes/hooks/useAutomationWorkflowActionMapper';
import { useWorkflowMapperBeforeTitleContent } from '@/automations/components/builder/nodes/hooks/useWorkflowMapperBeforeTitleContent';
import { PlaceHolderNode } from '@/automations/components/builder/nodes/components/PlaceHolderNode';
import TriggerNode from '@/automations/components/builder/nodes/components/TriggerNode';
import WorkflowNode from '@/automations/components/builder/nodes/components/WorkflowNode';
import { NodeData } from '@/automations/types';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { Card, Spinner, themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { TAutomationAction } from 'ui-modules';

export const WorkflowActionMapper = ({ id }: { id?: string }) => {
  const { detail, loading } = useAutomationWorkflowActionMapper(id);

  if (loading) {
    return <Spinner />;
  }

  if (!detail) {
    return 'Not found';
  }

  return (
    <WorkflowActionCanvas
      automationId={detail._id}
      actions={detail.actions || []}
    />
  );
};

const WorkflowActionCanvas = ({
  automationId,
  actions,
}: {
  automationId: string;
  actions: TAutomationAction[];
}) => {
  const theme = useAtomValue(themeState);
  const { onSelectActionWorkflow, selectedActionIds } =
    useActionsWorkflowNode(automationId);

  const { beforeTitleContent } = useWorkflowMapperBeforeTitleContent(
    selectedActionIds,
    onSelectActionWorkflow,
  );

  const [nodes] = useNodesState<Node<NodeData>>(
    generateNodes([], actions, [], { beforeTitleContent }),
  );
  const [edges] = useEdgesState<any>(generateEdges([], actions));

  return (
    <ReactFlowProvider>
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            trigger: TriggerNode,
            action: ActionNode,
            workflow: WorkflowNode,
            scratch: PlaceHolderNode,
          }}
          edgeTypes={{
            primary: PrimaryEdge,
          }}
          fitView
          colorMode={theme}
          minZoom={0.5}
          nodesDraggable={true}
          elementsSelectable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          connectionMode={ConnectionMode.Loose}
        >
          <Background />
          <Controls position="bottom-left" />
          <MiniMap position="top-left" />
        </ReactFlow>
        {selectedActionIds?.length > 0 && (
          <Card className="absolute bottom-4 border-2 border-dashed border-success text-muted-foreground text-center right-4 p-2 w-64 bg-background">
            <Card.Title>
              {selectedActionIds?.length} action
              {selectedActionIds?.length > 1 ? 's' : ''} selected
            </Card.Title>
          </Card>
        )}
      </div>
    </ReactFlowProvider>
  );
};
