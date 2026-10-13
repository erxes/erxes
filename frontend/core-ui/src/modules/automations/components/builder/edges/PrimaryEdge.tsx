import {
  EdgeInsertDropZone,
  EdgeInsertIndicator,
} from '@/automations/components/builder/edges/EdgeInsertDropZone';
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
import {
  IconColumnInsertRight,
  IconRowInsertBottom,
  IconScissors,
} from '@tabler/icons-react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { Button, cn } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const FOLK_PILL_CLASS: Record<string, string> = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
};

// Where the insert button sits relative to the cut point: a little further
// along the flow, and clear of the edge across it.
const INSERT_BRANCH_ALONG = 44;
const INSERT_BRANCH_ACROSS = 60;

type TEdgePathArgs = {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
};

const getEdgePath = (edgeType: unknown, args: TEdgePathArgs) => {
  if (edgeType === 'straight') {
    return getStraightPath(args);
  }
  if (edgeType === 'step') {
    return getSmoothStepPath({ ...args, borderRadius: 0 });
  }
  if (edgeType === 'smoothstep') {
    return getSmoothStepPath(args);
  }
  return getBezierPath(args);
};

const PrimaryEdge: FC<EdgeProps> = (edge) => {
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
  const { t } = useTranslation('automations');
  const { onDisconnect } = useNodeConnect();
  const { isReadOnly } = useAutomation();
  const { draggingNode } = useDnDMetaState();
  const { openNodeLibrary } = useAutomationBuilderSidebarHooks();
  const { canInsertOnEdge, insertDroppedNodeOnEdge } = useInsertNodeOnEdge();
  const setEdgeInsertTarget = useSetAtom(automationEdgeInsertTargetState);
  const insertHoverEdgeId = useAtomValue(automationInsertHoverEdgeIdState);
  const insertTarget = {
    source,
    sourceHandle: sourceHandleId ?? null,
    target,
  };

  const edgeType = data?.edgeType || 'default';
  const folkLabel = typeof data?.folkLabel === 'string' ? data.folkLabel : '';
  const folkType = typeof data?.folkType === 'string' ? data.folkType : '';
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
  const isDroppableHere =
    canInsert && draggingNode?.nodeType === AutomationNodeType.Action;
  const isNodeHoveringHere = insertHoverEdgeId === id;
  const isVertical = data?.flowDirection === 'vertical';
  const showEdgeActions =
    Boolean(selected) && !isReadOnly && !draggingNode && !isNodeHoveringHere;

  const branchOffset = isVertical
    ? { x: INSERT_BRANCH_ACROSS, y: INSERT_BRANCH_ALONG }
    : { x: INSERT_BRANCH_ALONG, y: INSERT_BRANCH_ACROSS };

  // Peels away from the edge and curves back into the button, so its hollow
  // side faces the flow it came off rather than bowing away from it. Drawn
  // with the edge's own generator; both ends run under the buttons.
  const [insertBranchPath] = getEdgePath(edgeType, {
    sourceX: labelX,
    sourceY: labelY,
    sourcePosition: isVertical ? Position.Right : Position.Bottom,
    targetX: labelX + branchOffset.x,
    targetY: labelY + branchOffset.y,
    targetPosition: isVertical ? Position.Top : Position.Left,
  });

  const onOpenLibraryForInsert = () => {
    setEdgeInsertTarget(insertTarget);
    openNodeLibrary(AutomationNodeType.Action);
  };

  return (
    <>
      <AnimatePresence>
        <motion.g
          key={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BaseEdge id={id} path={edgePath} />
        </motion.g>
      </AnimatePresence>

      <AnimatePresence>
        {showEdgeActions && canInsert && (
          <motion.g
            key={`${id}-insert-branch`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BaseEdge id={`${id}-insert-branch`} path={insertBranchPath} />
          </motion.g>
        )}
      </AnimatePresence>

      <EdgeLabelRenderer>
        <div
          className="absolute text-xs pointer-events-auto nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {folkLabel && !showEdgeActions && !isNodeHoveringHere && (
            // Opaque base: the tint alone lets the edge show through
            <span className="block rounded-full bg-background">
              <span
                className={cn(
                  'block whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground',
                  FOLK_PILL_CLASS[folkType],
                )}
              >
                {t(folkLabel)}
              </span>
            </span>
          )}
          <AnimatePresence>
            {isNodeHoveringHere && (
              <EdgeInsertIndicator
                key="insert-indicator"
                isVertical={isVertical}
              />
            )}

            {isDroppableHere && (
              <EdgeInsertDropZone
                key="insert-drop-zone"
                isVertical={isVertical}
                onInsert={(event) =>
                  insertDroppedNodeOnEdge(insertTarget, event)
                }
              />
            )}

            {showEdgeActions && (
              <motion.div
                key="edge-actions"
                className="relative"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full"
                  size="icon"
                  aria-label={t('edge-disconnect')}
                  title={t('edge-disconnect')}
                  onClick={() => onDisconnect(edge)}
                >
                  <IconScissors className="w-4 h-4 text-destructive" />
                </Button>

                {canInsert && (
                  <div
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) translate(${branchOffset.x}px, ${branchOffset.y}px)`,
                    }}
                  >
                    <Button
                      variant="outline"
                      className="rounded-full"
                      size="icon"
                      aria-label={t('edge-insert-action-here')}
                      title={t('edge-insert-action-here')}
                      onClick={onOpenLibraryForInsert}
                    >
                      {/* A plus reads as "connect one more"; this says the
                          action lands between the two ends instead. */}
                      {isVertical ? (
                        <IconRowInsertBottom className="w-4 h-4 text-accent-foreground" />
                      ) : (
                        <IconColumnInsertRight className="w-4 h-4 text-accent-foreground" />
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default PrimaryEdge;
