import 'react-grid-layout/css/styles.css';

import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';

import { BuilderNode } from '../types';
import { getDef } from '../elements/registry';

const StaticGrid = WidthProvider(GridLayout);

const COLS = 12;
const ROW_HEIGHT = 30;
const MARGIN: [number, number] = [12, 12];

const defaultSize = (type: string) => {
  const def = getDef(type);
  if (type === 'Spacer' || type === 'Divider') return { w: 12, h: 2 };
  if (def?.kind === 'atom') return { w: 6, h: 4 };
  if (def?.kind === 'molecule') return { w: 6, h: 6 };
  return { w: 12, h: 8 };
};

const RenderNode = ({ node }: { node: BuilderNode }) => {
  const def = getDef(node.type);

  if (!def) {
    return (
      <div className="rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component: <code>{node.type}</code>
      </div>
    );
  }

  const childrenRendered = node.children?.map((c) => (
    <RenderNode key={c.id} node={c} />
  ));

  return <def.Component node={node}>{childrenRendered}</def.Component>;
};

export const RenderTree = ({ node }: { node: BuilderNode }) => {
  // Top-level (Container) is rendered as a 12-col static grid.
  // Nested children are rendered with their default flow.
  const def = getDef(node.type);
  if (!def) {
    return (
      <div className="rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component: <code>{node.type}</code>
      </div>
    );
  }

  if (node.type !== 'Container') {
    return <RenderNode node={node} />;
  }

  const children = node.children ?? [];
  const layout: Layout[] = children.map((c, idx) => {
    const fb = defaultSize(c.type);
    const l = c.layout ?? { x: 0, y: idx * fb.h, w: fb.w, h: fb.h };
    return { i: c.id, x: l.x, y: l.y, w: l.w, h: l.h, static: true };
  });

  return (
    <StaticGrid
      className="layout"
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      margin={MARGIN}
      layout={layout}
      isDraggable={false}
      isResizable={false}
      compactType="vertical"
      preventCollision={false}
      useCSSTransforms
    >
      {children.map((c) => (
        <div key={c.id}>
          <RenderNode node={c} />
        </div>
      ))}
    </StaticGrid>
  );
};
