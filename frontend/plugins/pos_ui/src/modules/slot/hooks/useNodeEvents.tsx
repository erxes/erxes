import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { syncSelectedNodeAtom, slotDetailAtom, sidebarViewAtom } from '../states/slot';
import { CustomNode, NodeEventDetail } from '../types';

interface UseNodeEventsProps {
  nodes: CustomNode[];
  setNodes: (nodes: CustomNode[] | ((nodes: CustomNode[]) => CustomNode[])) => void;
  setHookNodes: (nodes: CustomNode[] | ((nodes: CustomNode[]) => CustomNode[])) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  setActiveTab: (tab: string) => void;
}

export const useNodeEvents = ({
  nodes,
  setNodes,
  setHookNodes,
  updateNodePosition,
  setActiveTab,
}: UseNodeEventsProps) => {
  const [selectedNode, setSelectedNode] = useAtom(syncSelectedNodeAtom);
  const [, setSlotDetail] = useAtom(slotDetailAtom);
  const [, setSidebarView] = useAtom(sidebarViewAtom);
  
  const nodesRef = useRef(nodes);
  const selectedNodeRef = useRef(selectedNode);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  useEffect(() => {
    const handleNodeResize = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (!detail?.id) return;
      
      const updateNodeData = (node: CustomNode) => {
        if (node.id === detail.id) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              width: detail.width || node.data.width,
              height: detail.height || node.data.height,
            },
            width: detail.width || node.width,
            height: detail.height || node.height,
          };

          if (detail.position) {
            updatedNode.position = detail.position;
            updatedNode.data.positionX = detail.position.x;
            updatedNode.data.positionY = detail.position.y;
          }

          return updatedNode;
        }
        return node;
      };

      const updateNodes = (nds: CustomNode[]) => nds.map(updateNodeData);
      setNodes(updateNodes);
      setHookNodes(updateNodes);

      if (selectedNodeRef.current?.id === detail.id) {
        const updatedNode = nodesRef.current.find((node) => node.id === detail.id);
        if (updatedNode) {
          const newSelectedNode = {
            ...updatedNode,
            data: {
              ...updatedNode.data,
              width: detail.width || updatedNode.data.width,
              height: detail.height || updatedNode.data.height,
            },
            width: detail.width || updatedNode.width,
            height: detail.height || updatedNode.height,
          } as CustomNode;

          setSelectedNode(newSelectedNode);
          setSlotDetail((prev) => ({
            ...prev,
            width: String(detail.width || updatedNode.data.width),
            height: String(detail.height || updatedNode.data.height),
            ...(detail.position && {
              left: String(detail.position.x),
              top: String(detail.position.y),
            }),
          }));
        }
      }
    };

    const handleNodePosition = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (detail?.id && detail.position) {
        updateNodePosition(detail.id, detail.position);
      }
    };

    const handleNodeRotate = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (!detail?.id) return;
      
      const rotateAngle = detail.rotateAngle !== undefined ? Number(detail.rotateAngle) : undefined;
      if (rotateAngle === undefined || isNaN(rotateAngle)) return;

      const updateNodeRotation = (node: CustomNode) => {
        if (node.id === detail.id) {
          return {
            ...node,
            data: {
              ...node.data,
              rotateAngle,
            },
          };
        }
        return node;
      };
      const updateNodes = (nds: CustomNode[]) => nds.map(updateNodeRotation);
      setNodes(updateNodes);
      setHookNodes(updateNodes);

      if (selectedNodeRef.current?.id === detail.id) {
        const updatedNode = nodesRef.current.find((node) => node.id === detail.id);
        if (updatedNode) {
          const newSelectedNode = {
            ...updatedNode,
            data: {
              ...updatedNode.data,
              rotateAngle,
            },
          } as CustomNode;

          setSelectedNode(newSelectedNode);
          setSlotDetail((prev) => ({
            ...prev,
            rotateAngle: String(rotateAngle),
          }));
        }
      }
    };

    const handleNodeEdit = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (!detail?.id) return;

      const node = nodesRef.current.find((n) => n.id === detail.id);
      if (node) {
        setSelectedNode(node as CustomNode);
        setSlotDetail({
          name: node.data.label,
          code: node.data.code,
          rounded: node.data.rounded,
          width: node.data.width.toString(),
          height: node.data.height.toString(),
          top: node.data.positionY.toString(),
          left: node.data.positionX.toString(),
          rotateAngle: node.data.rotateAngle.toString(),
          zIndex: node.data.zIndex.toString(),
          color: node.data.color,
          disabled: node.data.disabled,
          label: node.data.label,
        });
        setSidebarView('detail');
        setActiveTab('details');
      }
    };

    document.addEventListener('node:dimensions-change', handleNodeResize);
    document.addEventListener('node:position', handleNodePosition);
    document.addEventListener('node:rotate', handleNodeRotate);
    document.addEventListener('node:edit', handleNodeEdit);

    return () => {
      document.removeEventListener('node:dimensions-change', handleNodeResize);
      document.removeEventListener('node:position', handleNodePosition);
      document.removeEventListener('node:rotate', handleNodeRotate);
      document.removeEventListener('node:edit', handleNodeEdit);
    };
  }, [
    setNodes,
    setHookNodes,
    setSelectedNode,
    setSlotDetail,
    setSidebarView,
    updateNodePosition,
    setActiveTab,
  ]);
};