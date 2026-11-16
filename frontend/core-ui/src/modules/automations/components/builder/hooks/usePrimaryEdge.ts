import {
  getEdgePath,
  insertBranchOffsetOf,
  insertBranchPathOf,
} from '@/automations/components/builder/edges/edgePath';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useDnDMetaState } from '@/automations/context/AutomationBuilderDnDProvider';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useInsertNodeOnEdge } from '@/automations/hooks/useInsertNodeOnEdge';
import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import {
  automationEdgeInsertTargetState,
  automationInsertHoverEdgeIdState,
} from '@/automations/states/automationState';
import { AutomationNodeType } from '@/automations/types';
import { EdgeProps } from '@xyflow/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { DragEvent, useCallback, useMemo } from 'react';

const textOf = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * An edge of the flow: its path, its branch label, and the actions on it —
 * cut it, open the library to insert a step between its ends, or take a step
 * dragged onto it.
 */
export const usePrimaryEdge = (edge: EdgeProps) => {
  const {
    id,
    source,
    target,
    sourceHandleId,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
  } = edge;
  const { onDisconnect } = useNodeConnect();
  const { isReadOnly } = useAutomation();
  const { draggingNode } = useDnDMetaState();
  const { openNodeLibrary } = useAutomationBuilderSidebarHooks();
  const { canInsertOnEdge, insertDroppedNodeOnEdge } = useInsertNodeOnEdge();
  const setEdgeInsertTarget = useSetAtom(automationEdgeInsertTargetState);
  const insertHoverEdgeId = useAtomValue(automationInsertHoverEdgeIdState);

  const insertTarget = useMemo(
    () => ({ source, sourceHandle: sourceHandleId ?? null, target }),
    [source, sourceHandleId, target],
  );
  const edgeType = data?.edgeType || 'default';
  const isVertical = data?.flowDirection === 'vertical';
  const [edgePath, labelX, labelY] = getEdgePath(edgeType, {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const canInsert = canInsertOnEdge({
    source,
    target,
    sourceHandle: sourceHandleId,
    data,
  });
  const isNodeHoveringHere = insertHoverEdgeId === id;
  const showEdgeActions =
    !!selected && !isReadOnly && !draggingNode && !isNodeHoveringHere;
  const folkLabel = textOf(data?.folkLabel);
  const branchOffset = insertBranchOffsetOf(isVertical);

  const openLibraryForInsert = useCallback(() => {
    setEdgeInsertTarget(insertTarget);
    openNodeLibrary(AutomationNodeType.Action);
  }, [setEdgeInsertTarget, insertTarget, openNodeLibrary]);

  const disconnect = useCallback(
    () => onDisconnect(edge),
    [onDisconnect, edge],
  );

  const insertDropped = useCallback(
    (event: DragEvent<HTMLDivElement>) =>
      insertDroppedNodeOnEdge(insertTarget, event),
    [insertDroppedNodeOnEdge, insertTarget],
  );

  return {
    edgePath,
    isVertical,
    canInsert,
    isNodeHoveringHere,
    showEdgeActions,
    showInsertBranch: showEdgeActions && canInsert,
    insertBranchPath: insertBranchPathOf(edgeType, labelX, labelY, isVertical),
    isDroppableHere:
      canInsert && draggingNode?.nodeType === AutomationNodeType.Action,
    folkLabel,
    folkType: textOf(data?.folkType),
    showFolkLabel: !!folkLabel && !showEdgeActions && !isNodeHoveringHere,
    labelStyle: {
      transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
    },
    insertButtonStyle: {
      transform: `translate(-50%, -50%) translate(${branchOffset.x}px, ${branchOffset.y}px)`,
    },
    openLibraryForInsert,
    disconnect,
    insertDropped,
  };
};
