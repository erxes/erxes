import { BuilderNode } from '../types';
import { getDef } from '../elements/registry';

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
  const ordered = [...children].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  );
  const minHeight = Math.max(
    640,
    ...ordered
      .filter((c) => c.frame)
      .map((c) => c.frame!.y + (c.frame!.h ?? 200) + 80),
  );

  return (
    <div className="relative w-full" style={{ minHeight }}>
      {ordered.map((c) => {
        if (c.hidden) return null;
        const f = c.frame;
        const s = c.style ?? {};
        if (!f) {
          return (
            <div key={c.id} className="mb-3">
              <RenderNode node={c} />
            </div>
          );
        }
        return (
          <div
            key={c.id}
            className="absolute"
            style={{
              left: f.x,
              top: f.y,
              width: f.w,
              height: f.h,
              zIndex: c.zIndex ?? 0,
              paddingTop: s.paddingTop,
              paddingRight: s.paddingRight,
              paddingBottom: s.paddingBottom,
              paddingLeft: s.paddingLeft,
            }}
          >
            <RenderNode node={c} />
          </div>
        );
      })}
    </div>
  );
};
