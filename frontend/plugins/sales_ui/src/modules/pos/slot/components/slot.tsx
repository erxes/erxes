import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAtom } from 'jotai';
import { TableNode } from './tableNode';
import { isFullscreenAtom } from '../states/slot';
import NodeControls from './nodeControl';
import { cn } from 'erxes-ui/lib';
import { Tabs } from 'erxes-ui/components';
import SidebarList from './sideBar';
import SidebarDetail from './sideBarDetail';
import MiniMapToggle from './miniMap';
import { CustomNode, POSSlotsManagerProps } from '../types';
import { useSlotManager } from '../hooks/customHooks';
import { SNAP_GRID } from '@/pos/constants';
import { useNodeEvents } from '../hooks/useNodeEvents';

const POSSlotsManager = ({
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
    hasSlots,

    // Actions
    setSelectedNode,
    setSidebarView,
    updateNodePosition,

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
    handleAddNew,
  } = useSlotManager(posId, initialNodes);

  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('slots');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const snapGrid = useMemo(() => [...SNAP_GRID] as [number, number], []);

  const createNodeUpdater = useCallback(
    (updater: any) => {
      if (typeof updater === 'function') {
        handleNodesChange(updater(nodes));
      } else {
        handleNodesChange(updater);
      }
    },
    [nodes, handleNodesChange],
  );

  const setNodes = createNodeUpdater;
  const setHookNodes = createNodeUpdater;

  useNodeEvents({
    nodes,
    setNodes,
    setHookNodes,
    updateNodePosition,
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
  }, [slotDetail.left, slotDetail.top, selectedNode?.id, updateNodePosition]);

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

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        handleNodeClick(node);
        setActiveTab('details');
      }
    },
    [nodes, handleNodeClick],
  );

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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Loading slots...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex relative">
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
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
              <Controls position="bottom-right" showInteractive={false} />
              <MiniMapToggle
                nodeStrokeWidth={3}
                zoomable
                pannable
                position="top-left"
              />

              <NodeControls
                onAddSlot={handleAddSlot}
                onArrangeNodes={arrangeNodesInGrid}
                isFullscreen={isFullscreen}
                toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                selectedNode={selectedNode}
                onSave={handleSidebarSave}
                onDelete={() =>
                  selectedNode && handleDeleteSlot(selectedNode.id)
                }
                onAdd={handleAddNew}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {sidebarView !== 'hidden' && (
          <div
            className={cn(
              'w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out',
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
                  onNodeSelect={handleNodeSelect}
                  onAddNew={handleAddNew}
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
