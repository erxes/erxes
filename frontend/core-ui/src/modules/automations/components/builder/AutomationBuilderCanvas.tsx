import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { AutomationBuilderCanvasDragOverlay } from '@/automations/components/builder/AutomationBuilderCanvasDragOverlay';
import { AutomationBuilderControls } from '@/automations/components/builder/AutomationBuilderControls';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import { nodeTypes } from '@/automations/components/builder/nodes/nodeTypesRegistry';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { CANVAS_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { useReactFlowEditor } from '@/automations/hooks/useReactFlowEditor';
import { Background, MiniMap, ReactFlow } from '@xyflow/react';
import { useState } from 'react';

export const AutomationBuilderCanvas = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
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
        onConnect={onConnect}
        onDrop={onDrop}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
        connectionLineComponent={ConnectionLine}
        colorMode={theme}
        minZoom={0.5}
      >
        {showGrid && <Background />}
        {showMiniMap && <MiniMap pannable position="top-left" zoomable />}
        <AutomationBuilderControls
          showGrid={showGrid}
          showMiniMap={showMiniMap}
          onToggleGrid={() => setShowGrid((value) => !value)}
          onToggleMiniMap={() => setShowMiniMap((value) => !value)}
        />
      </ReactFlow>
      <AutomationBuilderCanvasDragOverlay />
      <AutomationBuilderSidebar />
    </div>
  );
};
