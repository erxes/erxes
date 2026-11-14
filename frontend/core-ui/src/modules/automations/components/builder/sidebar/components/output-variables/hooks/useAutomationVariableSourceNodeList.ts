import { CANVAS_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { getNodeColor } from '@/automations/utils/automationBuilderUtils/getNodeColor';
import { Node, useReactFlow } from '@xyflow/react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';

const FOCUS_DURATION_MS = 300;

/** The source node picker: the chosen node, picking another, and centring it. */
export const useAutomationVariableSourceNodeList = ({
  activeSourceNodeId,
  sourceNodes,
  onSelectSourceNode,
}: {
  activeSourceNodeId: string;
  sourceNodes: TAutomationVariableSourceNode[];
  onSelectSourceNode: (nodeId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { fitView, getNode } = useReactFlow<Node<NodeData>>();

  const selectedNode = useMemo(
    () => sourceNodes.find((node) => node.id === activeSourceNodeId),
    [activeSourceNodeId, sourceNodes],
  );

  const focusSelectedNode = useCallback(() => {
    const node = getNode(activeSourceNodeId);

    if (node) {
      fitView({
        nodes: [node],
        duration: FOCUS_DURATION_MS,
        ...CANVAS_FIT_VIEW_OPTIONS,
      });
    }
  }, [getNode, fitView, activeSourceNodeId]);

  const selectNode = useCallback(
    (nodeId: string) => {
      onSelectSourceNode(nodeId);
      setOpen(false);
    },
    [onSelectSourceNode],
  );

  return { open, setOpen, selectedNode, focusSelectedNode, selectNode };
};

/** How one source node reads in the list: its colour, name and kind. */
export const useAutomationVariableSourceNodeValue = (
  node: TAutomationVariableSourceNode,
) => {
  const { t } = useTranslation('automations');
  const defaultKind =
    node.nodeType === AutomationNodeType.Trigger ? t('trigger') : t('action');

  return {
    colorClassName: getNodeColor(node.nodeType),
    label: node.label || node.id,
    kindLabel: node.kindLabel ?? defaultKind,
  };
};
