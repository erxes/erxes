import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import {
  STRUCTURE_CANVAS_INDENT,
  STRUCTURE_CANVAS_V_GAP,
} from '../../constants/structureCanvas';
import { TStructureCanvasEdge } from '../../types/structureCanvas';

const CORNER_RADIUS = 8;

type TPoint = { x: number; y: number };

const distance = (a: TPoint, b: TPoint) => Math.hypot(a.x - b.x, a.y - b.y);

const towards = (from: TPoint, to: TPoint, length: number): TPoint => {
  const total = distance(from, to) || 1;

  return {
    x: from.x + ((to.x - from.x) * length) / total,
    y: from.y + ((to.y - from.y) * length) / total,
  };
};

const toRoundedPath = (points: TPoint[]) =>
  points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const next = points[index + 1];

    if (!next) {
      return `${path} L ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const radius = Math.min(
      CORNER_RADIUS,
      distance(previous, point) / 2,
      distance(point, next) / 2,
    );
    const start = towards(point, previous, radius);
    const end = towards(point, next, radius);

    return `${path} L ${start.x} ${start.y} Q ${point.x} ${point.y} ${end.x} ${end.y}`;
  }, '');

export const StructureCanvasEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<TStructureCanvasEdge>) => {
  if (!data?.compact) {
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: CORNER_RADIUS,
    });

    return <BaseEdge id={id} path={path} />;
  }

  const busY = sourceY + STRUCTURE_CANVAS_V_GAP / 2;
  const trunkX = targetX - STRUCTURE_CANVAS_INDENT / 2;

  return (
    <BaseEdge
      id={id}
      path={toRoundedPath([
        { x: sourceX, y: sourceY },
        { x: sourceX, y: busY },
        { x: trunkX, y: busY },
        { x: trunkX, y: targetY },
        { x: targetX, y: targetY },
      ])}
    />
  );
};
