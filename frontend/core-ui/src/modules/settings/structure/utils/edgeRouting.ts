export type EdgeSide = 'top' | 'right' | 'bottom' | 'left';

export interface RoutingRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoutingPoint {
  x: number;
  y: number;
}

export interface RouteEdgeOptions {
  source: RoutingRect;
  target: RoutingRect;
  obstacles?: RoutingRect[];
  padding?: number;
  stub?: number;
  maxChannelShift?: number;
}

export interface RoutedEdge {
  sourceHandle: EdgeSide;
  targetHandle: EdgeSide;
  points: RoutingPoint[];
}

const SIDE_PAIRS: [EdgeSide, EdgeSide][] = [
  ['bottom', 'top'],
  ['top', 'bottom'],
  ['right', 'left'],
  ['left', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
  ['top', 'left'],
  ['top', 'right'],
  ['right', 'top'],
  ['right', 'bottom'],
  ['left', 'top'],
  ['left', 'bottom'],
];

const SIDE_ANCHOR: Record<
  EdgeSide,
  { axis: 'x' | 'y'; anchor: (r: RoutingRect) => RoutingPoint }
> = {
  top: { axis: 'y', anchor: (r) => ({ x: r.x + r.w / 2, y: r.y }) },
  bottom: { axis: 'y', anchor: (r) => ({ x: r.x + r.w / 2, y: r.y + r.h }) },
  left: { axis: 'x', anchor: (r) => ({ x: r.x, y: r.y + r.h / 2 }) },
  right: { axis: 'x', anchor: (r) => ({ x: r.x + r.w, y: r.y + r.h / 2 }) },
};

const SIDE_DIR: Record<EdgeSide, RoutingPoint> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const add = (p: RoutingPoint, d: RoutingPoint, n: number): RoutingPoint => ({
  x: p.x + d.x * n,
  y: p.y + d.y * n,
});

const simplify = (points: RoutingPoint[]): RoutingPoint[] => {
  const deduped = points.filter(
    (p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y,
  );
  return deduped.filter((p, i) => {
    if (i === 0 || i === deduped.length - 1) return true;
    const a = deduped[i - 1];
    const b = deduped[i + 1];
    const collinear =
      (a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y);
    return !collinear;
  });
};

export const segmentIntersectsRect = (
  a: RoutingPoint,
  b: RoutingPoint,
  rect: RoutingRect,
  padding = 0,
): boolean => {
  const x1 = rect.x - padding;
  const y1 = rect.y - padding;
  const x2 = rect.x + rect.w + padding;
  const y2 = rect.y + rect.h + padding;
  if (a.x === b.x) {
    const lo = Math.min(a.y, b.y);
    const hi = Math.max(a.y, b.y);
    return a.x > x1 && a.x < x2 && hi > y1 && lo < y2;
  }
  if (a.y === b.y) {
    const lo = Math.min(a.x, b.x);
    const hi = Math.max(a.x, b.x);
    return a.y > y1 && a.y < y2 && hi > x1 && lo < x2;
  }
  return true;
};

const countCollisions = (
  points: RoutingPoint[],
  obstacles: RoutingRect[],
  endpointRects: RoutingRect[],
  padding: number,
): number => {
  let hits = 0;
  for (let i = 0; i < points.length - 1; i++) {
    for (const rect of obstacles) {
      if (segmentIntersectsRect(points[i], points[i + 1], rect, padding)) {
        hits += 1;
      }
    }
    // Interior segments (between the two stubs) must not pass through the
    // source or target cards either — only the stubs may touch them.
    if (i > 0 && i < points.length - 2) {
      for (const rect of endpointRects) {
        if (segmentIntersectsRect(points[i], points[i + 1], rect)) {
          hits += 1;
        }
      }
    }
  }
  return hits;
};

const buildRoute = (
  source: RoutingRect,
  sourceSide: EdgeSide,
  target: RoutingRect,
  targetSide: EdgeSide,
  stub: number,
  channelShift: number,
  cornerVariant: number,
): RoutingPoint[] => {
  const s = SIDE_ANCHOR[sourceSide].anchor(source);
  const t = SIDE_ANCHOR[targetSide].anchor(target);
  const sOut = add(s, SIDE_DIR[sourceSide], stub);
  const tIn = add(t, SIDE_DIR[targetSide], stub);
  const sAxis = SIDE_ANCHOR[sourceSide].axis;
  const tAxis = SIDE_ANCHOR[targetSide].axis;

  if (sAxis === tAxis) {
    const channel =
      (sAxis === 'y' ? (sOut.y + tIn.y) / 2 : (sOut.x + tIn.x) / 2) +
      channelShift;
    const c1 =
      sAxis === 'y'
        ? { x: sOut.x, y: channel }
        : { x: channel, y: sOut.y };
    const c2 =
      sAxis === 'y'
        ? { x: tIn.x, y: channel }
        : { x: channel, y: tIn.y };
    return [s, sOut, c1, c2, tIn, t];
  }
  const straightFirst =
    sAxis === 'y' ? { x: sOut.x, y: tIn.y } : { x: tIn.x, y: sOut.y };
  const turnFirst =
    sAxis === 'y' ? { x: tIn.x, y: sOut.y } : { x: sOut.x, y: tIn.y };
  const corner = cornerVariant === 0 ? straightFirst : turnFirst;
  return [s, sOut, corner, tIn, t];
};

export const routeEdge = ({
  source,
  target,
  obstacles = [],
  padding = 8,
  stub = 24,
  maxChannelShift = 10,
}: RouteEdgeOptions): RoutedEdge => {
  let best: { route: RoutingPoint[]; hits: number; pair: [EdgeSide, EdgeSide] } | null =
    null;

  for (const pair of SIDE_PAIRS) {
    const [sourceSide, targetSide] = pair;
    const sameAxis =
      SIDE_ANCHOR[sourceSide].axis === SIDE_ANCHOR[targetSide].axis;
    const attempts = sameAxis
      ? Array.from(
          { length: maxChannelShift * 2 + 1 },
          (_, i) => ({
            shift: (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * stub,
            corner: 0,
          }),
        )
      : [{ shift: 0, corner: 0 }, { shift: 0, corner: 1 }];

    for (const { shift, corner } of attempts) {
      const route = buildRoute(
        source,
        sourceSide,
        target,
        targetSide,
        stub,
        shift,
        corner,
      );
      const hits = countCollisions(route, obstacles, [source, target], padding);
      if (hits === 0) {
        return {
          sourceHandle: sourceSide,
          targetHandle: targetSide,
          points: simplify(route),
        };
      }
      if (!best || hits < best.hits) {
        best = { route, hits, pair };
      }
    }
  }

  return best
    ? {
        sourceHandle: best.pair[0],
        targetHandle: best.pair[1],
        points: simplify(best.route),
      }
    : { sourceHandle: 'bottom', targetHandle: 'top', points: [] };
};

export const pointsToSvgPath = (
  points: RoutingPoint[],
  radius = 8,
): string => {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M${points[0].x} ${points[0].y}`;
  }
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];
    const lenIn = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const lenOut = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, lenIn / 2, lenOut / 2);
    if (r <= 0) {
      d += ` L${cur.x} ${cur.y}`;
      continue;
    }
    const inX = cur.x - ((cur.x - prev.x) / lenIn) * r;
    const inY = cur.y - ((cur.y - prev.y) / lenIn) * r;
    const outX = cur.x + ((next.x - cur.x) / lenOut) * r;
    const outY = cur.y + ((next.y - cur.y) / lenOut) * r;
    d += ` L${inX} ${inY} Q${cur.x} ${cur.y} ${outX} ${outY}`;
  }
  d += ` L${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
};
