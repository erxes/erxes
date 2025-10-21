import { useHistoryBeforeTitleContent } from '@/automations/components/builder/history/hooks/useHistoryBeforeTitleContent';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';

import { Background, ConnectionMode, Controls, ReactFlow } from '@xyflow/react';
import { IAutomationHistory } from 'ui-modules';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import TriggerNode from '@/automations/components/builder/nodes/components/TriggerNode';
import ActionNode from '@/automations/components/builder/nodes/components/ActionNode';
import PrimaryEdge from '@/automations/components/builder/edges/PrimaryEdge';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};
const edgeTypes = {
  primary: PrimaryEdge,
};

export const AutomationHistoryByFlow = ({
  history,
}: {
  history: IAutomationHistory;
}) => {
  const { triggersConst, actionsConst } = useAutomation();
  const { triggers, actions, workflows } = useAutomationNodes();

  const { beforeTitleContent } = useHistoryBeforeTitleContent(history);
  const nodes = generateNodes(triggers, actions, workflows, {
    constants: { triggersConst, actionsConst },
    beforeTitleContent,
  });

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
