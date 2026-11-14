import {
  EdgeInsertDropZone,
  EdgeInsertIndicator,
} from '@/automations/components/builder/edges/EdgeInsertDropZone';
import { usePrimaryEdge } from '@/automations/components/builder/hooks/usePrimaryEdge';
import {
  IconColumnInsertRight,
  IconRowInsertBottom,
  IconScissors,
} from '@tabler/icons-react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from '@xyflow/react';
import { Button, cn } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const FOLK_PILL_CLASS: Record<string, string> = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
};

const PrimaryEdge: FC<EdgeProps> = (edge) => {
  const { id } = edge;
  const { t } = useTranslation('automations');
  const {
    edgePath,
    isVertical,
    canInsert,
    isNodeHoveringHere,
    showEdgeActions,
    showInsertBranch,
    insertBranchPath,
    isDroppableHere,
    folkLabel,
    folkType,
    showFolkLabel,
    labelStyle,
    insertButtonStyle,
    openLibraryForInsert,
    disconnect,
    insertDropped,
  } = usePrimaryEdge(edge);

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
        {showInsertBranch && (
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
          style={labelStyle}
        >
          {showFolkLabel && (
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
                onInsert={insertDropped}
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
                  onClick={disconnect}
                >
                  <IconScissors className="w-4 h-4 text-destructive" />
                </Button>

                {canInsert && (
                  <div
                    className="absolute left-1/2 top-1/2"
                    style={insertButtonStyle}
                  >
                    <Button
                      variant="outline"
                      className="rounded-full"
                      size="icon"
                      aria-label={t('edge-insert-action-here')}
                      title={t('edge-insert-action-here')}
                      onClick={openLibraryForInsert}
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
