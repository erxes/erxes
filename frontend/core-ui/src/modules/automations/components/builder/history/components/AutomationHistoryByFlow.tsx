import { useHistoryBeforeTitleContent } from '@/automations/components/builder/history/hooks/useHistoryBeforeTitleContent';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';

import PrimaryEdge from '@/automations/components/builder/edges/PrimaryEdge';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import ActionNode from '@/automations/components/builder/nodes/components/ActionNode';
import TriggerNode from '@/automations/components/builder/nodes/components/TriggerNode';
import { generateEdges } from '@/automations/utils/automationBuilderUtils/generateEdges';
import { generateNodes } from '@/automations/utils/automationBuilderUtils/generateNodes';
import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  HISTORY_FLOW_FIT_VIEW_OPTIONS,
} from '@/automations/constants';
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useEffect, useRef } from 'react';
import { IAutomationHistory } from 'ui-modules';
import '@xyflow/react/dist/style.css';

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

// The container is resized after mount (split panel drag, direction switch) and
// the nodes arrive with the query, so the initial fitView goes stale.
const FitViewOnResize = ({
  containerRef,
  nodeCount,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  nodeCount: number;
}) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        fitView(HISTORY_FLOW_FIT_VIEW_OPTIONS),
      );
    };

    const observer = new ResizeObserver(refit);
    observer.observe(container);
    refit();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, fitView, nodeCount]);

  return null;
};

export const AutomationHistoryByFlow = () => {
  const { nodes, triggers, actions } = useAutomationHistoryByFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full w-full overflow-hidden" ref={containerRef}>
      <ReactFlow
        nodes={nodes}
        edges={generateEdges(triggers, actions)}
        fitView
        fitViewOptions={HISTORY_FLOW_FIT_VIEW_OPTIONS}
        minZoom={CANVAS_MIN_ZOOM}
        maxZoom={CANVAS_MAX_ZOOM}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        elementsSelectable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <FitViewOnResize containerRef={containerRef} nodeCount={nodes.length} />
        <Background gap={16} size={3} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
