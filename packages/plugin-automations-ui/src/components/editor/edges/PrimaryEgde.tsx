import React, { FC } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from 'reactflow';
import { EdgeButton } from '../styles';

const Edge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  source,
  sourceHandleId,
  data
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const { onDisconnect } = data;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          {selected && (
            <EdgeButton
              onClick={() => {
                onDisconnect({
                  id,
                  source,
                  sourceHandle: sourceHandleId
                });
              }}
            >
              ×
            </EdgeButton>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default Edge;
