import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useUpdatePosSlots } from './useSlotAdd';
import { useToast } from 'erxes-ui/hooks';
import { CustomNode } from '../slot/types';
import { queries } from '../graphql';

interface UsePosSlotReturn {
  nodes: CustomNode[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  loading: boolean;
  error: any;
  refetch: () => void;
  addSlot: (nodeData?: Partial<CustomNode['data']>) => CustomNode;
  updateSlot: (id: string, updates: Partial<CustomNode>) => void;
  deleteSlot: (id: string) => void;
  saveSlots: (posId: string) => Promise<boolean>;
  hasSlots: boolean;
}

export function usePosSlots(posId: string): UsePosSlotReturn {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const { updatePosSlots } = useUpdatePosSlots();
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery(queries.posSlots, {
    variables: { posId },
    skip: !posId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const transformSlotsToNodes = useCallback((slots: any[]): CustomNode[] => {
    return slots.map((slot) => {
      const x = Number(slot.option?.left) || 0;
      const y = Number(slot.option?.top) || 0;
      const width = Number(slot.option?.width) || 80;
      const height = Number(slot.option?.height) || 80;

      return {
        id: slot._id,
        type: 'tableNode',
        position: { x, y },
        width,
        height,
        data: {
          label: slot.name || `TABLE ${slot._id}`,
          code: slot.code || slot._id,
          color: slot.option?.color || '#4F46E5',
          width: slot.option?.width || width,
          height: slot.option?.height || height,
          positionX: x,
          positionY: y,
          rounded: (slot.option?.borderRadius || 0) > 0,
          rotateAngle: Number(slot.option?.rotateAngle) || 0,
          zIndex: Number(slot.option?.zIndex) || 0,
          disabled: false,
        },
      };
    });
  }, []);

  const transformNodesToSlots = useCallback(
    (nodesToTransform: CustomNode[], targetPosId: string) => {
      return nodesToTransform.map((node) => {
        const x = node.position?.x ?? node.data.positionX ?? 0;
        const y = node.position?.y ?? node.data.positionY ?? 0;

        return {
          _id: node.id,
          posId: targetPosId,
          name: node.data.label || `TABLE ${node.id}`,
          code: node.data.code || node.id,
          option: {
            width: node.data.width || 80,
            height: node.data.height || 80,
            top: y,
            left: x,
            rotateAngle: node.data.rotateAngle || 0,
            borderRadius: node.data.rounded ? 8 : 0,
            color: node.data.color || '#4F46E5',
            zIndex: node.data.zIndex || 0,
            isShape: false,
          },
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (data?.posSlots && Array.isArray(data.posSlots)) {
      const transformedNodes = transformSlotsToNodes(data.posSlots);
      setNodes(transformedNodes);
    }
  }, [data, transformSlotsToNodes]);

  const generateNextId = useCallback((currentNodes: CustomNode[]): string => {
    if (currentNodes.length === 0) return '1';

    const numericIds = currentNodes
      .map((node) => parseInt(node.id, 10))
      .filter((id) => !isNaN(id));

    if (numericIds.length === 0) return '1';

    return String(Math.max(...numericIds) + 1);
  }, []);

  const saveSlots = useCallback(
    async (targetPosId: string) => {
      try {
        const slotsData = transformNodesToSlots(nodes, targetPosId);

        await updatePosSlots({
          variables: {
            posId: targetPosId,
            slots: slotsData,
          },
        });

        toast({
          title: 'Slots saved successfully',
          description: `Saved ${slotsData.length} slots to the database`,
        });

        await refetch();
        return true;
      } catch (error) {
        console.error('Failed to save slots:', error);
        toast({
          title: 'Failed to save slots',
          description: 'Please try again later',
          variant: 'destructive',
        });
        return false;
      }
    },
    [nodes, transformNodesToSlots, updatePosSlots, toast, refetch],
  );

  const addSlot = useCallback(
    (nodeData?: Partial<CustomNode['data']>) => {
      const newId = generateNextId(nodes);
      const x = nodeData?.positionX ?? 250 + (nodes.length % 3) * 200;
      const y = nodeData?.positionY ?? 100 + Math.floor(nodes.length / 3) * 150;
      const width = nodeData?.width ?? 80;
      const height = nodeData?.height ?? 80;

      const newNode: CustomNode = {
        id: newId,
        type: 'tableNode',
        position: { x, y },
        width,
        height,
        data: {
          label: nodeData?.label || `TABLE ${newId}`,
          code: nodeData?.code || newId,
          color: nodeData?.color || '#4F46E5',
          width,
          height,
          positionX: x,
          positionY: y,
          rounded: nodeData?.rounded || false,
          rotateAngle: nodeData?.rotateAngle || 0,
          zIndex: nodeData?.zIndex || 0,
          disabled: nodeData?.disabled || false,
        },
      };

      setNodes((prev) => [...prev, newNode]);
      return newNode;
    },
    [nodes, generateNextId],
  );

  const updateSlot = useCallback((id: string, updates: Partial<CustomNode>) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === id) {
          const updatedNode = { ...node, ...updates };

          if (updates.position) {
            updatedNode.data = {
              ...updatedNode.data,
              positionX: updates.position.x,
              positionY: updates.position.y,
            };
          } else if (
            updates.data?.positionX !== undefined ||
            updates.data?.positionY !== undefined
          ) {
            updatedNode.position = {
              x: updates.data.positionX ?? node.position.x,
              y: updates.data.positionY ?? node.position.y,
            };
          }

          return updatedNode;
        }
        return node;
      }),
    );
  }, []);

  const deleteSlot = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  }, []);

  return {
    nodes,
    setNodes,
    loading,
    error,
    refetch,
    addSlot,
    updateSlot,
    deleteSlot,
    saveSlots,
    hasSlots: nodes.length > 0,
  };
}
