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
} from '@/pos/constants';

export const useSlotManager = (
  posId: string,
  initialNodes: CustomNode[] = [],
) => {
  const { toast } = useToast();

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
    if (hookNodes.length > 0) return hookNodes;
    if (initialNodes.length > 0) return initialNodes;
    return [DefaultNode];
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
      setNodes(hookNodes);
    }
  }, [hookNodes, setNodes]);

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
      const updateNode = (node: CustomNode) => {
        if (node.id === nodeId) {
          return {
            ...node,
            position,
            data: {
              ...node.data,
              positionX: position.x,
              positionY: position.y,
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
          position,
          data: {
            ...selectedNode.data,
            positionX: position.x,
            positionY: position.y,
          },
        });
      }

      if (!skipSlotDetailSync) {
        syncPositionToSlotDetail(nodeId, position);
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
          syncPositionToSlotDetail(change.id, change.position);
        }
      });
    },
    [onNodesChangeInternal, syncPositionToSlotDetail],
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
      setSlotDetail({
        name: nodeData.data.label,
        code: nodeData.data.code,
        rounded: nodeData.data.rounded,
        width: nodeData.data.width.toString(),
        height: nodeData.data.height.toString(),
        top: (nodeData.position?.y ?? nodeData.data.positionY ?? 0).toString(),
        left: (nodeData.position?.x ?? nodeData.data.positionX ?? 0).toString(),
        rotateAngle: nodeData.data.rotateAngle.toString(),
        zIndex: nodeData.data.zIndex.toString(),
        color: nodeData.data.color,
        disabled: nodeData.data.disabled,
        label: nodeData.data.label,
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
    const x = Number(slotDetail.left);
    const y = Number(slotDetail.top);
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

    try {
      await hookSaveSlots(posId);
      toast({
        title: 'Slot updated and saved',
        description: `Updated slot: ${slotDetail.name}`,
      });
      setSidebarView('list');
      setSelectedNode(null);
      return true;
    } catch (error) {
      console.error('Failed to save slot:', error);
      toast({
        title: 'Slot updated locally',
        description: 'Failed to save to server. Changes are local only.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [
    slotDetail,
    setNodes,
    setHookNodes,
    setSidebarView,
    setSelectedNode,
    toast,
    hookSaveSlots,
    posId,
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

      try {
        await hookSaveSlots(posId);
        toast({
          title: 'Slot deleted and saved',
          description: `Deleted slot: ${id}`,
        });
      } catch (error) {
        console.error('Failed to save after deletion:', error);
        toast({
          title: 'Slot deleted locally',
          description: 'Failed to save to server. Changes are local only.',
          variant: 'destructive',
        });
      }
    },
    [
      hookDeleteSlot,
      hookSaveSlots,
      setNodes,
      setEdges,
      setSidebarView,
      setSelectedNode,
      toast,
      posId,
    ],
  );

  const handleDuplicateSlot = useCallback(
    (id: string) => {
      const nodeToDuplicate = nodesRef.current.find((node) => node.id === id);
      if (!nodeToDuplicate) return;

      const newId = generateNextId(nodesRef.current);
      const newNode: CustomNode = {
        ...nodeToDuplicate,
        id: newId,
        position: {
          x: nodeToDuplicate.position.x + 30,
          y: nodeToDuplicate.position.y + 30,
        },
        data: {
          ...nodeToDuplicate.data,
          code: newId,
          label: `${nodeToDuplicate.data.label} (Copy)`,
          positionX: nodeToDuplicate.position.x + 30,
          positionY: nodeToDuplicate.position.y + 30,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setHookNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Slot duplicated',
        description: `Duplicated slot: ${nodeToDuplicate.data.label}`,
      });
    },
    [setNodes, setHookNodes, toast, generateNextId],
  );

  const arrangeNodesInGrid = useCallback(() => {
    const arrangedNodes = nodesRef.current.map((node, index) => {
      const column = index % GRID_LAYOUT.COLUMNS;
      const row = Math.floor(index / GRID_LAYOUT.COLUMNS);
      const x = GRID_LAYOUT.START_X + column * GRID_LAYOUT.SPACING_X;
      const y = GRID_LAYOUT.START_Y + row * GRID_LAYOUT.SPACING_Y;

      return {
        ...node,
        position: { x, y },
        data: { ...node.data, positionX: x, positionY: y },
      };
    });

    setNodes(arrangedNodes);
    setHookNodes(arrangedNodes);
    toast({
      title: 'Layout arranged',
      description: 'Slots have been arranged in a grid layout',
    });
  }, [setNodes, setHookNodes, toast]);

  const handleAddNew = useCallback(
    (nodeData?: Partial<TableNodeData>) => {
      const newId = generateNextId(nodesRef.current);
      const newPositionX = 250 + (nodesRef.current.length % 2) * 200;
      const newPositionY = 100 + Math.floor(nodesRef.current.length / 2) * 150;

      const newNode: CustomNode = {
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
          rounded: nodeData?.rounded || false,
          rotateAngle: nodeData?.rotateAngle || 0,
          zIndex: nodeData?.zIndex || 0,
          disabled: nodeData?.disabled || false,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setHookNodes((nds) => [...nds, newNode]);
      toast({
        title: 'Slot added',
        description: `Added new slot: ${newNode.data.label}`,
      });
    },
    [setNodes, setHookNodes, toast, generateNextId],
  );

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
  };
};
