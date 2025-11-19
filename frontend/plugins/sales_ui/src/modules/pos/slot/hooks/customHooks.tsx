import { useCallback, useRef, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type NodeChange,
} from '@xyflow/react';
import { useAtom } from 'jotai';
import { useToast } from 'erxes-ui/hooks';
import {
  syncSelectedNodeAtom,
  slotDetailAtom,
  sidebarViewAtom,
} from '../states/slot';
import { usePosSlots } from '@/pos/hooks/usePosSlots';
import { CustomNode, TableNodeData } from '../types';
import {
  DEFAULT_SLOT_DIMENSIONS,
  DefaultNode,
  GRID_LAYOUT,
  CANVAS,
} from '@/pos/constants';

export const useSlotManager = (
  posId: string,
  initialNodes: CustomNode[] = [],
) => {
  const { toast } = useToast();

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const clampPositionForNode = useCallback((node: CustomNode): CustomNode => {
    const nodeWidth =
      (node?.data?.width as number | undefined) ||
      DEFAULT_SLOT_DIMENSIONS.WIDTH;
    const nodeHeight =
      (node?.data?.height as number | undefined) ||
      DEFAULT_SLOT_DIMENSIONS.HEIGHT;
    const pos = node.position || {
      x: (node.data?.positionX as number | undefined) || 0,
      y: (node.data?.positionY as number | undefined) || 0,
    };
    const maxX = Math.max(0, CANVAS.WIDTH - nodeWidth);
    const maxY = Math.max(0, CANVAS.HEIGHT - nodeHeight);
    const x = clamp(pos.x, 0, maxX);
    const y = clamp(pos.y, 0, maxY);
    return {
      ...node,
      position: { x, y },
      data: { ...node.data, positionX: x, positionY: y },
    };
  }, []);

  const {
    nodes: hookNodes,
    setNodes: setHookNodes,
    loading: slotsLoading,
    error: slotsError,
    addSlot: hookAddSlot,
    saveSlots: hookSaveSlots,
    deleteSlot: hookDeleteSlot,
    hasSlots,
  } = usePosSlots(posId);

  const getInitialNodes = () => {
    if (hookNodes.length > 0) return hookNodes.map(clampPositionForNode);
    if (initialNodes.length > 0) return initialNodes.map(clampPositionForNode);
    return [clampPositionForNode(DefaultNode)];
  };

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<CustomNode>(
    getInitialNodes(),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNode, setSelectedNode] = useAtom(syncSelectedNodeAtom);
  const [slotDetail, setSlotDetail] = useAtom(slotDetailAtom);
  const [sidebarView, setSidebarView] = useAtom(sidebarViewAtom);

  const nodesRef = useRef(nodes);
  const selectedNodeRef = useRef(selectedNode);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  useEffect(() => {
    if (hookNodes.length > 0) {
      setNodes(hookNodes.map(clampPositionForNode));
    }
  }, [hookNodes, setNodes, clampPositionForNode]);

  useEffect(() => {
    if (slotsError) {
      toast({
        title: 'Failed to load slots',
        description: 'There was an error loading the slots data',
        variant: 'destructive',
      });
    }
  }, [slotsError, toast]);

  const generateNextId = useCallback((currentNodes: CustomNode[]): string => {
    if (currentNodes.length === 0) return '1';
    const numericIds = currentNodes
      .map((node) => parseInt(node.id, 10))
      .filter((id) => !isNaN(id));
    if (numericIds.length === 0) return '1';
    return String(Math.max(...numericIds) + 1);
  }, []);

  const syncPositionToSlotDetail = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      if (selectedNode && selectedNode.id === nodeId) {
        setSlotDetail((prev) => ({
          ...prev,
          left: String(position.x),
          top: String(position.y),
        }));
      }
    },
    [selectedNode, setSlotDetail],
  );

  const updateNodePosition = useCallback(
    (
      nodeId: string,
      position: { x: number; y: number },
      skipSlotDetailSync = false,
    ) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      const nodeWidth =
        (node?.data?.width as number | undefined) ||
        DEFAULT_SLOT_DIMENSIONS.WIDTH;
      const nodeHeight =
        (node?.data?.height as number | undefined) ||
        DEFAULT_SLOT_DIMENSIONS.HEIGHT;

      const maxX = Math.max(0, CANVAS.WIDTH - nodeWidth);
      const maxY = Math.max(0, CANVAS.HEIGHT - nodeHeight);

      const nextPosition = {
        x: clamp(position.x, 0, maxX),
        y: clamp(position.y, 0, maxY),
      };

      const updateNode = (node: CustomNode) => {
        if (node.id === nodeId) {
          return {
            ...node,
            position: nextPosition,
            data: {
              ...node.data,
              positionX: nextPosition.x,
              positionY: nextPosition.y,
            },
          };
        }
        return node;
      };

      setNodes((nds) => nds.map(updateNode));
      setHookNodes((nds) => nds.map(updateNode));

      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          position: nextPosition,
          data: {
            ...selectedNode.data,
            positionX: nextPosition.x,
            positionY: nextPosition.y,
          },
        });
      }

      if (!skipSlotDetailSync) {
        syncPositionToSlotDetail(nodeId, nextPosition);
      }
    },
    [
      setNodes,
      setHookNodes,
      selectedNode,
      setSelectedNode,
      syncPositionToSlotDetail,
    ],
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeInternal(changes as NodeChange<CustomNode>[]);
      changes.forEach((change) => {
        if (
          change.type === 'position' &&
          change.position &&
          change.dragging === false
        ) {
          const node = nodesRef.current.find((n) => n.id === change.id);
          const nodeWidth =
            (node?.data?.width as number | undefined) ||
            DEFAULT_SLOT_DIMENSIONS.WIDTH;
          const nodeHeight =
            (node?.data?.height as number | undefined) ||
            DEFAULT_SLOT_DIMENSIONS.HEIGHT;
          const maxX = Math.max(0, CANVAS.WIDTH - nodeWidth);
          const maxY = Math.max(0, CANVAS.HEIGHT - nodeHeight);
          const clamped = {
            x: clamp(change.position.x, 0, maxX),
            y: clamp(change.position.y, 0, maxY),
          };
          updateNodePosition(change.id, clamped, false);
        }
      });
    },
    [onNodesChangeInternal, updateNodePosition],
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: '#5E5CFF' } },
          eds,
        ),
      );
      toast({
        title: 'Connection created',
        description: `Connected ${params.source} to ${params.target}`,
      });
    },
    [setEdges, toast],
  );

  const handleNodeClick = useCallback(
    (nodeData: CustomNode) => {
      setSelectedNode(nodeData);
      // Fix table naming by converting "TABLE X" to "Table X" format
      const fixedLabel = nodeData.data.label.replace(
        /^TABLE (\d+)$/,
        'Table $1',
      );
      setSlotDetail({
        name: fixedLabel,
        code: nodeData.data.code,
        rounded: Number(nodeData.data.rounded) || 0,
        width: nodeData.data.width.toString(),
        height: nodeData.data.height.toString(),
        top: (nodeData.position?.y ?? nodeData.data.positionY ?? 0).toString(),
        left: (nodeData.position?.x ?? nodeData.data.positionX ?? 0).toString(),
        rotateAngle: nodeData.data.rotateAngle.toString(),
        zIndex: nodeData.data.zIndex.toString(),
        color: nodeData.data.color,
        disabled: nodeData.data.disabled,
        label: fixedLabel,
      });
      setSidebarView('detail');
    },
    [setSelectedNode, setSidebarView, setSlotDetail],
  );

  const handleAddSlot = useCallback(() => {
    const newNode = hookAddSlot();
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: 'Slot added',
      description: `Added new slot: ${newNode.data.label}`,
    });
  }, [hookAddSlot, setNodes, toast]);

  const handleSaveSlotDetail = useCallback(async () => {
    if (!selectedNodeRef.current) return false;

    const width = Number(slotDetail.width) || DEFAULT_SLOT_DIMENSIONS.WIDTH;
    const height = Number(slotDetail.height) || DEFAULT_SLOT_DIMENSIONS.HEIGHT;
    const maxX = Math.max(0, CANVAS.WIDTH - width);
    const maxY = Math.max(0, CANVAS.HEIGHT - height);
    const x = clamp(Number(slotDetail.left), 0, maxX);
    const y = clamp(Number(slotDetail.top), 0, maxY);
    const rotateAngle = Number(slotDetail.rotateAngle) || 0;
    const zIndex = Number(slotDetail.zIndex) || 0;

    const updatedNode = {
      ...selectedNodeRef.current,
      position: { x, y },
      width,
      height,
      data: {
        ...selectedNodeRef.current.data,
        label: slotDetail.name || `TABLE ${selectedNodeRef.current.id}`,
        code: slotDetail.code || selectedNodeRef.current.id,
        color: slotDetail.color,
        width,
        height,
        positionX: x,
        positionY: y,
        rounded: slotDetail.rounded,
        rotateAngle,
        zIndex,
        disabled: slotDetail.disabled,
      },
    };

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeRef.current?.id ? updatedNode : node,
      ),
    );
    setHookNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeRef.current?.id ? updatedNode : node,
      ),
    );

    toast({
      title: 'Slot updated',
      description: `Updated slot: ${slotDetail.name}. Click 'Save Changes' to persist.`,
    });
    setSidebarView('list');
    setSelectedNode(null);
    return true;
  }, [
    slotDetail,
    setNodes,
    setHookNodes,
    setSidebarView,
    setSelectedNode,
    toast,
  ]);

  const handleDeleteSlot = useCallback(
    async (id: string) => {
      hookDeleteSlot(id);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );

      if (selectedNodeRef.current && selectedNodeRef.current.id === id) {
        setSelectedNode(null);
        setSidebarView('list');
      }

      toast({
        title: 'Slot deleted',
        description: `Deleted slot: ${id}. Click 'Save Changes' to persist.`,
      });
    },
    [
      hookDeleteSlot,
      setNodes,
      setEdges,
      setSidebarView,
      setSelectedNode,
      toast,
    ],
  );

  const handleDuplicateSlot = useCallback(
    (id: string) => {
      const nodeToDuplicate = nodesRef.current.find((node) => node.id === id);
      if (!nodeToDuplicate) return;

      const newId = generateNextId(nodesRef.current);
      const newPositionX = nodeToDuplicate.position.x + 30;
      const newPositionY = nodeToDuplicate.position.y + 30;

      const proposed = {
        ...nodeToDuplicate,
        id: newId,
        position: {
          x: newPositionX,
          y: newPositionY,
        },
        width: nodeToDuplicate.width || nodeToDuplicate.data.width,
        height: nodeToDuplicate.height || nodeToDuplicate.data.height,
        data: {
          ...nodeToDuplicate.data,
          code: newId,
          label: `${nodeToDuplicate.data.label} (Copy)`,
          positionX: newPositionX,
          positionY: newPositionY,
          width: nodeToDuplicate.data.width,
          height: nodeToDuplicate.data.height,
          color: nodeToDuplicate.data.color,
          rounded: nodeToDuplicate.data.rounded,
          rotateAngle: nodeToDuplicate.data.rotateAngle,
          zIndex: nodeToDuplicate.data.zIndex,
        },
      } as CustomNode;
      const newNode = clampPositionForNode(proposed);

      setNodes((nds) => [...nds, newNode]);
      setHookNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Slot duplicated',
        description: `Duplicated slot: ${nodeToDuplicate.data.label}`,
      });
    },
    [setNodes, setHookNodes, toast, generateNextId, clampPositionForNode],
  );

  const arrangeNodesInGrid = useCallback(() => {
    const arrangedNodes = nodesRef.current.map((node, index) => {
      const column = index % GRID_LAYOUT.COLUMNS;
      const row = Math.floor(index / GRID_LAYOUT.COLUMNS);
      const x = GRID_LAYOUT.START_X + column * GRID_LAYOUT.SPACING_X;
      const y = GRID_LAYOUT.START_Y + row * GRID_LAYOUT.SPACING_Y;

      const proposed = {
        ...node,
        position: { x, y },
        data: { ...node.data, positionX: x, positionY: y },
      } as CustomNode;
      return clampPositionForNode(proposed);
    });

    setNodes(arrangedNodes);
    setHookNodes(arrangedNodes);
    toast({
      title: 'Layout arranged',
      description: 'Slots have been arranged in a grid layout',
    });
  }, [setNodes, setHookNodes, toast, clampPositionForNode]);

  const handleAddNew = useCallback(
    (nodeData?: Partial<TableNodeData>) => {
      const newId = generateNextId(nodesRef.current);
      const newPositionX = 250 + (nodesRef.current.length % 2) * 200;
      const newPositionY = 100 + Math.floor(nodesRef.current.length / 2) * 150;

      const proposed: CustomNode = {
        id: newId,
        type: 'tableNode',
        position: { x: newPositionX, y: newPositionY },
        data: {
          label: nodeData?.label || `TABLE ${newId}`,
          code: nodeData?.code || newId,
          color: nodeData?.color || '#4F46E5',
          width: nodeData?.width || DEFAULT_SLOT_DIMENSIONS.WIDTH,
          height: nodeData?.height || DEFAULT_SLOT_DIMENSIONS.HEIGHT,
          positionX: newPositionX,
          positionY: newPositionY,
          rounded: typeof nodeData?.rounded === 'number' ? nodeData.rounded : 0,

          rotateAngle: nodeData?.rotateAngle || 0,
          zIndex: nodeData?.zIndex || 0,
          disabled: nodeData?.disabled || false,
        },
      };
      const newNode = clampPositionForNode(proposed);

      setNodes((nds) => [...nds, newNode]);
      setHookNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Slot added',
        description: `Added new slot: ${newNode.data.label}`,
      });
    },
    [setNodes, setHookNodes, toast, generateNextId, clampPositionForNode],
  );

  const handleSaveAllChanges = useCallback(async () => {
    try {
      await hookSaveSlots(posId);
      toast({
        title: 'Changes saved',
        description: 'All slot changes have been saved successfully',
      });
      return true;
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast({
        title: 'Failed to save changes',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  }, [hookSaveSlots, posId, toast]);

  return {
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
    handleSaveAllChanges,
  };
};
