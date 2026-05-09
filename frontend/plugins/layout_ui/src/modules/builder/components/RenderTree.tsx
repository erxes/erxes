import { BuilderNode } from '../types';
import { getDef } from '../elements/registry';

export const RenderTree = ({ node }: { node: BuilderNode }) => {
  const def = getDef(node.type);

  if (!def) {
    return (
      <div className="rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component: <code>{node.type}</code>
      </div>
    );
  }

  const childrenRendered = node.children?.map((child) => (
    <RenderTree key={child.id} node={child} />
  ));

  return <def.Component node={node}>{childrenRendered}</def.Component>;
};
