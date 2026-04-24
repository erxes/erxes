import { CANVAS, SNAP_GRID } from '@/pos/constants';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useViewport,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, cn, Sheet, Spinner, Tabs, useIsMobile } from 'erxes-ui';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSlotManager } from '../hooks/customHooks';
import { useNodeEvents } from '../hooks/useNodeEvents';
import { CustomNode, POSSlotsManagerProps } from '../types';
import MiniMapToggle from './miniMap';
import NodeControls from './nodeControl';
import SidebarList from './sideBar';
import SidebarDetail from './sideBarDetail';
import { TableNode } from './tableNode';

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
  const [slotsSheetOpen, setSlotsSheetOpen] = useState(false);

  const isMobile = useIsMobile();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const slotsButtonRef = useRef<HTMLButtonElement>(null);
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
      setSlotsSheetOpen(true);
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

  const handleOpenSlots = useCallback(() => {
    setSlotsSheetOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback(
    (next: boolean) => {
      setSlotsSheetOpen(next);
      if (!next) {
        if (selectedNode) {
          setSelectedNode(null);
          setSidebarView('list');
        }
        setActiveTab('slots');
        slotsButtonRef.current?.focus();
      }
    },
    [selectedNode, setSelectedNode, setSidebarView],
  );

  if (slotsLoading && !hasSlots) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 border bg-background">
      <div className="relative flex flex-1 min-h-0">
        <div
          className="flex-1 w-full h-full overflow-hidden"
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
                ref={slotsButtonRef}
                onAddSlot={handleAddSlot}
                onArrangeNodes={arrangeNodesInGrid}
                onSaveChanges={handleSaveAllChanges}
                isCreating={isCreating}
                saving={slotsSaving}
                onOpenSlots={handleOpenSlots}
                slotsOpen={slotsSheetOpen}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <Sheet open={slotsSheetOpen} onOpenChange={handleSheetOpenChange}>
          <Sheet.View
            side={isMobile ? 'bottom' : 'right'}
            aria-label="Slots"
            className={cn(
              'flex flex-col p-0',
              isMobile &&
                'h-[90dvh] inset-x-0 bottom-0 rounded-b-none w-full max-w-full',
              isDragging && 'opacity-50',
            )}
          >
            <Sheet.Header className="justify-between shrink-0">
              <Sheet.Title>
                {activeTab === 'details' ? 'Slot Detail' : 'Slots'}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                Manage the slots available on this POS floor plan.
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="flex-1 min-h-0 p-0 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            </Sheet.Content>

            {activeTab === 'details' && selectedNode && (
              <Sheet.Footer className="border-t shrink-0">
                <Button variant="outline" onClick={handleSidebarCancel}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleSidebarSave}>
                  Save
                </Button>
              </Sheet.Footer>
            )}
          </Sheet.View>
        </Sheet>
      </div>
    </div>
  );
};

export default POSSlotsManager;
