import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
  syncSelectedNodeAtom,
  slotDetailAtom,
  sidebarViewAtom,
} from '../states/slot';
import { CustomNode, NodeEventDetail } from '../types';

interface UseNodeEventsProps {
  nodes: CustomNode[];
  updateNodePosition: (
    nodeId: string,
    position: { x: number; y: number },
  ) => void;
  updateNodeDimensions: (
    nodeId: string,
    dimensions: {
      width?: number;
      height?: number;
      position?: { x: number; y: number };
    },
  ) => void;
  setActiveTab: (tab: string) => void;
}

export const useNodeEvents = ({
  nodes,
  updateNodePosition,
  updateNodeDimensions,
  setActiveTab,
}: UseNodeEventsProps) => {
  const [, setSelectedNode] = useAtom(syncSelectedNodeAtom);
  const [, setSlotDetail] = useAtom(slotDetailAtom);
  const [, setSidebarView] = useAtom(sidebarViewAtom);

  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    const handleNodeResize = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (!detail?.id) return;

      updateNodeDimensions(detail.id, {
        width: detail.width,
        height: detail.height,
        position: detail.position,
      });
    };

    const handleNodePosition = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (detail?.id && detail.position) {
        updateNodePosition(detail.id, detail.position);
      }
    };

    const handleNodeRotate = (event: Event) => {
      const { detail } = event as CustomEvent<NodeEventDetail>;
      if (!detail?.id || detail.rotateAngle === undefined) return;
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
    setSelectedNode,
    setSlotDetail,
    setSidebarView,
    updateNodePosition,
    updateNodeDimensions,
    setActiveTab,
  ]);
};
