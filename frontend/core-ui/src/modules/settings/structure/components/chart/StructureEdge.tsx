import { BaseEdge, EdgeProps } from '@xyflow/react';
import {
  pointsToSvgPath,
  RoutingPoint,
} from '../../utils/edgeRouting';

export const StructureEdge = ({ data }: EdgeProps) => {
  const points = (data as { points?: RoutingPoint[] } | undefined)?.points;
  if (!points || points.length < 2) return null;
  return <BaseEdge path={pointsToSvgPath(points, 8)} />;
};
