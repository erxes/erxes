import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { AutomationBuilderCanvasDragOverlay } from '@/automations/components/builder/AutomationBuilderCanvasDragOverlay';
import { AutomationBuilderControls } from '@/automations/components/builder/controls/AutomationBuilderControls';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import { nodeTypes } from '@/automations/components/builder/nodes/nodeTypesRegistry';
import {
  CANVAS_FIT_VIEW_OPTIONS,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
} from '@/automations/constants';
import { MarqueeSelectionPanel } from '@/automations/components/builder/marquee/MarqueeSelectionPanel';
import { useReactFlowEditor } from '@/automations/hooks/useReactFlowEditor';
import {
  automationCanvasMarqueeModeState,
  automationCanvasViewState,
} from '@/automations/states/automationState';
import { Background, MiniMap, ReactFlow, SelectionMode } from '@xyflow/react';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAtomValue } from 'jotai';
import '@xyflow/react/dist/style.css';

export const AutomationBuilderCanvas = () => {
  const { isReadOnly } = useAutomation();
  const { showGrid, showMiniMap } = useAtomValue(automationCanvasViewState);
  const isMarqueeMode = useAtomValue(automationCanvasMarqueeModeState);
  const {
    theme,
    reactFlowWrapper,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    editorWrapper,
    onConnect,
    onDrop,
    isValidConnection,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onDragOver,
    onNodeDragStop,
    setReactFlowInstance,
  } = useReactFlowEditor();

  return (
    <div className="relative h-full flex-1" ref={reactFlowWrapper}>
      <ReactFlow
        ref={editorWrapper}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={isReadOnly ? undefined : onConnect}
        onDrop={isReadOnly ? undefined : onDrop}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        onDragOver={isReadOnly ? undefined : onDragOver}
        fitView
        fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
        connectionLineComponent={ConnectionLine}
        colorMode={theme}
        minZoom={CANVAS_MIN_ZOOM}
        maxZoom={CANVAS_MAX_ZOOM}
        selectionOnDrag={isMarqueeMode}
        panOnDrag={isMarqueeMode ? [1, 2] : true}
        selectionMode={SelectionMode.Partial}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        deleteKeyCode={isReadOnly ? null : undefined}
      >
        {showGrid && <Background />}
        {showMiniMap && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            style={{ width: 140, height: 100 }}
            className="overflow-hidden rounded-md border shadow-sm"
          />
        )}
        <MarqueeSelectionPanel isMarqueeMode={isMarqueeMode} />
        <AutomationBuilderControls />
      </ReactFlow>
      <AutomationBuilderCanvasDragOverlay />
    </div>
  );
};
