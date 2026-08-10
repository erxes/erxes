import { useNodeConnect } from '@/automations/hooks/useNodeConnect';
import { IconScissors } from '@tabler/icons-react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { Button } from 'erxes-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

const PrimaryEdge: FC<EdgeProps> = (edge) => {
  const {
    id,
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
  const edgeType = data?.edgeType || 'default';
  const pathArgs = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };
  const [edgePath, labelX, labelY] =
    edgeType === 'straight'
      ? getStraightPath(pathArgs)
      : edgeType === 'step'
        ? getSmoothStepPath({ ...pathArgs, borderRadius: 0 })
        : edgeType === 'smoothstep'
          ? getSmoothStepPath(pathArgs)
          : getBezierPath(pathArgs);

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

      <EdgeLabelRenderer>
        <div
          className="absolute text-xs pointer-events-auto nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <AnimatePresence>
            {selected && (
              <motion.div
                key="scissors"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full"
                  size="icon"
                  onClick={() => onDisconnect(edge)}
                >
                  <IconScissors className="w-4 h-4 text-destructive" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default PrimaryEdge;
