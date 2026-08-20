import {
  AutomationHistoryFlowProvider,
  useAutomationHistoryFlow,
} from '@/automations/components/builder/history/context/AutomationHistoryFlowContext';
import { useAutomationExecutionSelection } from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomationHistoryFlowFitView } from '@/automations/components/builder/history/hooks/useAutomationHistoryFlowFitView';
import { nodeTypes } from '@/automations/components/builder/nodes/nodeTypesRegistry';
import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  HISTORY_FLOW_FIT_VIEW_OPTIONS,
} from '@/automations/constants';
import { Background, ReactFlow } from '@xyflow/react';
import { useRef } from 'react';
import '@xyflow/react/dist/style.css';

const AutomationHistoryFlowCanvas = () => {
  const { nodes, edges } = useAutomationHistoryFlow();
  const { selectAction, clearSelection } = useAutomationExecutionSelection();
  const containerRef = useRef<HTMLDivElement>(null);

  const { onMoveStart } = useAutomationHistoryFlowFitView(
    containerRef,
    nodes.length,
  );

  return (
    <div className="h-full min-w-0 flex-1 overflow-hidden" ref={containerRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={HISTORY_FLOW_FIT_VIEW_OPTIONS}
        minZoom={CANVAS_MIN_ZOOM}
        maxZoom={CANVAS_MAX_ZOOM}
        // Node clicks open the result panel; this also keeps pointer events on
        // the nodes, which react-flow drops for fully inert canvases
        onNodeClick={(_, node) => selectAction(node.id)}
        onPaneClick={clearSelection}
        onMoveStart={onMoveStart}
        // A run is a record: it can be panned and zoomed, never edited
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
      >
        <Background gap={16} size={3} />
      </ReactFlow>
    </div>
  );
};

export const AutomationHistoryFlow = () => (
  <AutomationHistoryFlowProvider>
    <AutomationHistoryFlowCanvas />
  </AutomationHistoryFlowProvider>
);
