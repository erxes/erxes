import { useHistoryBeforeTitleContent } from '@/automations/components/builder/history/hooks/useHistoryBeforeTitleContent';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';

import PrimaryEdge from '@/automations/components/builder/edges/PrimaryEdge';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/hooks/useAutomationExecutionDetail';
import ActionNode from '@/automations/components/builder/nodes/components/ActionNode';
import TriggerNode from '@/automations/components/builder/nodes/components/TriggerNode';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import { Background, ConnectionMode, Controls, ReactFlow } from '@xyflow/react';
import { IAutomationHistory } from 'ui-modules';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};
const edgeTypes = {
  primary: PrimaryEdge,
};

const useAutomationHistoryByFlow = () => {
  const { executionDetail, loading } = useAutomationExecutionDetail();
  const { triggersConst, actionsConst } = useAutomation();
  const { triggers, actions, workflows } = useAutomationNodes();

  const { beforeTitleContent } = useHistoryBeforeTitleContent(
    executionDetail as IAutomationHistory,
  );
  const nodes = generateNodes(triggers, actions, workflows, {
    constants: { triggersConst, actionsConst },
    beforeTitleContent,
  });
  return { executionDetail, loading, nodes, triggers, actions };
};

export const AutomationHistoryByFlow = () => {
  const { nodes, triggers, actions } = useAutomationHistoryByFlow();

  return (
    <div className="h-full">
      <ReactFlow
        nodes={nodes}
        edges={generateEdges(triggers, actions)}
        fitView
        fitViewOptions={{ padding: 4, minZoom: 0.8 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        elementsSelectable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Background gap={16} size={3} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
