import {
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
} from '@xyflow/react';

// Where the insert button sits relative to the cut point: a little further
// along the flow, and clear of the edge across it
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

/** The path of an edge drawn in the automation's chosen edge style. */
export const getEdgePath = (edgeType: unknown, args: TEdgePathArgs) => {
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

export const insertBranchOffsetOf = (isVertical: boolean) =>
  isVertical
    ? { x: INSERT_BRANCH_ACROSS, y: INSERT_BRANCH_ALONG }
    : { x: INSERT_BRANCH_ALONG, y: INSERT_BRANCH_ACROSS };

/**
 * The short branch from the cut point to the insert button. It peels away
 * from the edge and curves back into the button, so its hollow side faces the
 * flow it came off; drawn with the edge's own generator.
 */
export const insertBranchPathOf = (
  edgeType: unknown,
  labelX: number,
  labelY: number,
  isVertical: boolean,
) => {
  const offset = insertBranchOffsetOf(isVertical);
  const [path] = getEdgePath(edgeType, {
    sourceX: labelX,
    sourceY: labelY,
    sourcePosition: isVertical ? Position.Right : Position.Bottom,
    targetX: labelX + offset.x,
    targetY: labelY + offset.y,
    targetPosition: isVertical ? Position.Top : Position.Left,
  });

  return path;
};
