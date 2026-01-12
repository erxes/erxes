import type { FC } from 'react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  useViewport,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './tableNode';
import NodeControls from './nodeControl';
import { cn, Tabs, Spinner } from 'erxes-ui';
import SidebarList from './sideBar';
import SidebarDetail from './sideBarDetail';
import MiniMapToggle from './miniMap';
import { CustomNode, POSSlotsManagerProps } from '../types';
import { useSlotManager } from '../hooks/customHooks';
import { SNAP_GRID, CANVAS } from '@/pos/constants';
import { useNodeEvents } from '../hooks/useNodeEvents';

type CanvasBoundsProps = {
  width: number;
  height: number;
};

const CanvasBounds = ({ width, height }: CanvasBoundsProps) => {
  const { x, y, zoom } = useViewport();
  return (
    <div
      className="absolute top-0 left-0 z-50 border-2 pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        width,
        height,
      }}
    />
  );
};

const POSSlotsManager: FC<POSSlotsManagerProps> = ({
  posId,
  initialNodes = [],
  onNodesChange,
  isCreating = false,
}: POSSlotsManagerProps) => {
  const {
    // State
    nodes,
    edges,
    selectedNode,
    slotDetail,
    sidebarView,
    slotsLoading,
    slotsSaving,
    hasSlots,

    // Actions
    setSelectedNode,
    setSidebarView,
    updateNodePosition,
    updateNodeDimensions,

    // Handlers
    handleNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleAddSlot,
    handleSaveSlotDetail,
    handleDeleteSlot,
    handleDuplicateSlot,
    arrangeNodesInGrid,
    handleSaveAllChanges,
  } = useSlotManager(posId, initialNodes);

  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('slots');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const snapGrid = useMemo(() => [...SNAP_GRID] as [number, number], []);

  useNodeEvents({
    nodes,
    updateNodePosition,
    updateNodeDimensions,
    setActiveTab,
  });

  useEffect(() => {
    if (selectedNode && slotDetail.left && slotDetail.top) {
      const formX = Number(slotDetail.left);
      const formY = Number(slotDetail.top);
      const currentX =
        selectedNode.position?.x ?? selectedNode.data.positionX ?? 0;
      const currentY =
        selectedNode.position?.y ?? selectedNode.data.positionY ?? 0;

      if (formX !== currentX || formY !== currentY) {
        updateNodePosition(selectedNode.id, { x: formX, y: formY }, true);
      }
    }
  }, [slotDetail.left, slotDetail.top, selectedNode, updateNodePosition]);

  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      handleNodeClick(node as CustomNode);
      setActiveTab('details');
    },
    [handleNodeClick],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSidebarView('list');
    setActiveTab('slots');
  }, [setSidebarView, setSelectedNode]);

  const handleSidebarSave = useCallback(async () => {
    try {
      await handleSaveSlotDetail();
      setActiveTab('slots');
    } catch (error) {
      console.error('Error saving slot detail:', error);
    }
  }, [handleSaveSlotDetail]);

  const handleSidebarCancel = useCallback(() => {
    setSidebarView('list');
    setSelectedNode(null);
    setActiveTab('slots');
  }, [setSidebarView, setSelectedNode]);

  if (slotsLoading && !hasSlots) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen border bg-background">
      <div className="flex relative flex-1">
        <div
          className="overflow-hidden flex-1 w-full h-full"
          ref={reactFlowWrapper}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid
              snapGrid={snapGrid}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={undefined} gap={12} size={1} />

              <CanvasBounds width={CANVAS.WIDTH} height={CANVAS.HEIGHT} />

              <MiniMapToggle
                nodeStrokeWidth={3}
                zoomable
                pannable
                position="top-left"
              />

              <NodeControls
                onAddSlot={handleAddSlot}
                onArrangeNodes={arrangeNodesInGrid}
                onSaveChanges={handleSaveAllChanges}
                isCreating={isCreating}
                saving={slotsSaving}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {sidebarView !== 'hidden' && (
          <div
            className={cn(
              'w-80 border-l bg-background',
              isDragging ? 'opacity-50' : 'opacity-100',
            )}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <Tabs.Content value="slots" className="m-0">
                <SidebarList
                  nodes={nodes}
                  selectedNode={selectedNode}
                  onNodeClick={onNodeClick}
                  onAddSlot={handleAddSlot}
                  onDuplicateSlot={handleDuplicateSlot}
                  onDeleteSlot={handleDeleteSlot}
                />
              </Tabs.Content>

              <Tabs.Content value="details" className="m-0">
                {selectedNode && (
                  <SidebarDetail
                    onSave={handleSidebarSave}
                    onCancel={handleSidebarCancel}
                  />
                )}
              </Tabs.Content>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSlotsManager;
