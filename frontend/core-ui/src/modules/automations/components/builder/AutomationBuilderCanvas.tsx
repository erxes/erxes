import ConnectionLine from '@/automations/components/builder/edges/connectionLine';
import { AutomationBuilderCanvasDragOverlay } from '@/automations/components/builder/AutomationBuilderCanvasDragOverlay';
import { edgeTypes } from '@/automations/components/builder/edges/edgeTypesRegistry';
import { nodeTypes } from '@/automations/components/builder/nodes/nodeTypesRegistry';
import { AutomationBuilderSidebar } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebar';
import { CANVAS_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { useReactFlowEditor } from '@/automations/hooks/useReactFlowEditor';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';

export const AutomationBuilderCanvas = () => {
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
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={CANVAS_FIT_VIEW_OPTIONS}
        connectionLineComponent={ConnectionLine}
        colorMode={theme}
        minZoom={0.5}
      >
        <Controls />
        <Background />
        <MiniMap pannable position="top-left" zoomable />
      </ReactFlow>
      <AutomationBuilderCanvasDragOverlay />
      <AutomationBuilderSidebar />
    </div>
  );
};
