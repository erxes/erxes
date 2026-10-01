import {
  pointsToSvgPath,
  routeEdge,
  RoutingRect,
  segmentIntersectsRect,
} from './edgeRouting';

const rect = (x: number, y: number, w = 264, h = 96): RoutingRect => ({
  x,
  y,
  w,
  h,
});

const pathCrossesAny = (
  points: { x: number; y: number }[],
  obstacles: RoutingRect[],
  padding = 8,
) =>
  points.slice(0, -1).some((p, i) =>
    obstacles.some((r) =>
      segmentIntersectsRect(p, points[i + 1], r, padding),
    ),
  );

describe('segmentIntersectsRect', () => {
  const r = rect(100, 100, 50, 50);

  it('detects vertical segment through rect', () => {
    expect(
      segmentIntersectsRect({ x: 120, y: 0 }, { x: 120, y: 300 }, r),
    ).toBe(true);
  });

  it('detects horizontal segment through rect', () => {
    expect(
      segmentIntersectsRect({ x: 0, y: 120 }, { x: 300, y: 120 }, r),
    ).toBe(true);
  });

  it('misses segment beside rect', () => {
    expect(
      segmentIntersectsRect({ x: 10, y: 0 }, { x: 10, y: 300 }, r),
    ).toBe(false);
  });

  it('respects padding', () => {
    const seg = [{ x: 95, y: 0 }, { x: 95, y: 300 }];
    expect(segmentIntersectsRect(seg[0], seg[1], r, 0)).toBe(false);
    expect(segmentIntersectsRect(seg[0], seg[1], r, 8)).toBe(true);
  });
});

describe('routeEdge', () => {
  it('prefers bottom→top for a child directly below', () => {
    const source = rect(0, 0);
    const target = rect(0, 200);
    const routed = routeEdge({ source, target });
    expect(routed.sourceHandle).toBe('bottom');
    expect(routed.targetHandle).toBe('top');
    expect(routed.points[0]).toEqual({ x: 132, y: 96 });
    expect(routed.points[routed.points.length - 1]).toEqual({
      x: 132,
      y: 200,
    });
    expect(routed.points.length).toBe(2);
  });

  it('prefers top→bottom for a child above its parent', () => {
    const source = rect(0, 300);
    const target = rect(0, 0);
    const routed = routeEdge({ source, target });
    expect(routed.sourceHandle).toBe('top');
    expect(routed.targetHandle).toBe('bottom');
  });

  it('uses a side pair when the vertical corridor is blocked', () => {
    const source = rect(0, 0);
    const target = rect(500, 0);
    // wide blocker covering every horizontal channel below/above the row
    const blocker = rect(120, 110, 520, 40);
    const routed = routeEdge({ source, target, obstacles: [blocker] });
    expect(routed.sourceHandle).toBe('right');
    expect(routed.targetHandle).toBe('left');
    expect(pathCrossesAny(routed.points, [blocker])).toBe(false);
  });

  it('routes around a sibling sitting between parent and child', () => {
    const source = rect(0, 0);
    const target = rect(0, 400);
    const blocker = rect(0, 200);
    const routed = routeEdge({
      source,
      target,
      obstacles: [blocker],
    });
    expect(pathCrossesAny(routed.points, [blocker])).toBe(false);
  });

  it('routes around a blocker when child is beside parent', () => {
    const source = rect(0, 0);
    const target = rect(400, 0);
    const blocker = rect(300, -40, 60, 180);
    const routed = routeEdge({
      source,
      target,
      obstacles: [blocker],
    });
    expect(pathCrossesAny(routed.points, [blocker])).toBe(false);
  });

  it('falls back to fewest collisions when every route is blocked', () => {
    const source = rect(500, 500);
    const target = rect(0, 0);
    // surround the source on all sides
    const obstacles = [
      rect(500 - 264 - 10, 500), // left
      rect(500 + 264 + 10, 500), // right
      rect(500, 500 - 96 - 40), // above
      rect(500, 500 + 96 + 40), // below
    ];
    const routed = routeEdge({ source, target, obstacles });
    expect(routed.points.length).toBeGreaterThanOrEqual(2);
    // route starts on the source rect's boundary
    const start = routed.points[0];
    expect(
      start.x === 500 ||
        start.x === 764 ||
        start.y === 500 ||
        start.y === 596,
    ).toBe(true);
  });
});

describe('pointsToSvgPath', () => {
  it('returns empty for no points', () => {
    expect(pointsToSvgPath([])).toBe('');
  });

  it('draws a straight line for two points', () => {
    expect(
      pointsToSvgPath([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    ).toBe('M0 0 L10 10');
  });

  it('rounds corners with Q curves', () => {
    const d = pointsToSvgPath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
      8,
    );
    expect(d).toContain('Q');
    expect(d.startsWith('M0 0')).toBe(true);
    expect(d.endsWith('L100 100')).toBe(true);
  });
});
