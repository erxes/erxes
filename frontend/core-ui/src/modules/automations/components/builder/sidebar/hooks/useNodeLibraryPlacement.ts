import { useAutomation } from '@/automations/context/AutomationProvider';
import { automationEdgeInsertTargetState } from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { splitAwaitingConnectionId } from '@/automations/utils/automationConnectionUtils';
import { Node, useReactFlow } from '@xyflow/react';
import { useAtomValue } from 'jotai';

export type TNodeLibraryPlacement = {
  sourceLabel: string;
  /** Empty when the pick is appended rather than inserted before something. */
  targetLabel: string;
  /** The named output the pick hangs off, when the source has more than one. */
  branchLabel: string;
};

/**
 * Where the next library pick will land. The library is opened from three
 * places and only two of them aim at a spot, so the panel would otherwise say
 * nothing about a choice the user has already made on the canvas.
 */
export const useNodeLibraryPlacement = (): TNodeLibraryPlacement | null => {
  const { awaitingToConnectNodeId } = useAutomation();
  const edgeInsertTarget = useAtomValue(automationEdgeInsertTargetState);
  const { getNode } = useReactFlow<Node<NodeData>>();

  const getLabel = (nodeId?: string) =>
    String(getNode(nodeId || '')?.data?.label || '');

  // A plain forward handle names nothing worth showing.
  const getBranchLabel = (handleKey?: string) =>
    !handleKey || handleKey === 'right' ? '' : handleKey;

  if (edgeInsertTarget) {
    return {
      sourceLabel: getLabel(edgeInsertTarget.source),
      targetLabel: getLabel(edgeInsertTarget.target),
      branchLabel: getBranchLabel(
        (edgeInsertTarget.sourceHandle || '').split('-')[0],
      ),
    };
  }

  if (awaitingToConnectNodeId) {
    const [, nodeId, handleKey] = splitAwaitingConnectionId(
      awaitingToConnectNodeId,
    );

    return {
      sourceLabel: getLabel(nodeId),
      targetLabel: '',
      branchLabel: getBranchLabel(handleKey),
    };
  }

  return null;
};
