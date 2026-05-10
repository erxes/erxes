import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import {
  IconCopy,
  IconGripHorizontal,
  IconTrash,
} from '@tabler/icons-react';
import { ScrollArea, cn } from 'erxes-ui';

import {
  deviceAtom,
  pageDraftAtom,
  paletteDragTypeAtom,
  selectedNodeIdAtom,
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { getDef } from '../elements/registry';
import { BuilderNode } from '../types';

const ResponsiveGrid = WidthProvider(GridLayout);

const COLS = 12;
const ROW_HEIGHT = 30;
const MARGIN: [number, number] = [12, 12];

const widthFor = (mode: 'desktop' | 'tablet' | 'mobile') =>
  mode === 'mobile' ? 375 : mode === 'tablet' ? 768 : null;

const sizeForType = (type: string) => {
  const def = getDef(type);
  const kind = def?.kind;
  if (type === 'Spacer' || type === 'Divider') return { w: 12, h: 2 };
  if (kind === 'atom') return { w: 6, h: 4 };
  if (kind === 'molecule') return { w: 6, h: 6 };
  return { w: 12, h: 8 };
};

const layoutFromNodes = (nodes: BuilderNode[]): Layout[] =>
  nodes.map((n, idx) => {
    const def = getDef(n.type);
    const fallback = sizeForType(n.type);
    const l = n.layout ?? {
      x: 0,
      y: idx * fallback.h,
      w: fallback.w,
      h: fallback.h,
    };
    return {
      i: n.id,
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
      minW: 1,
      minH: 1,
      isResizable: !def ? false : true,
    };
  });

const NodeCard = ({
  node,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  node: BuilderNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const def = getDef(node.type);

  if (!def) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component: <code className="ml-1">{node.type}</code>
      </div>
    );
  }

  const childrenRendered = node.children?.map((c) => {
    const childDef = getDef(c.type);
    if (!childDef) return null;
    return (
      <childDef.Component key={c.id} node={c}>
        {c.children?.map((cc) => {
          const ccDef = getDef(cc.type);
          if (!ccDef) return null;
          return <ccDef.Component key={cc.id} node={cc} />;
        })}
      </childDef.Component>
    );
  });

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-md border bg-background transition',
        selected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-transparent hover:border-primary/40',
      )}
    >
      <div
        className={cn(
          'layout-drag-handle absolute left-1 top-1 z-10 flex cursor-grab items-center gap-1 rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm transition active:cursor-grabbing',
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        title="Drag to move"
      >
        <IconGripHorizontal size={12} />
        {def.label}
      </div>
      <div
        className={cn(
          'absolute right-1 top-1 z-10 flex items-center gap-0.5 transition',
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="rounded bg-background/90 p-1 text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
          title="Duplicate"
        >
          <IconCopy size={12} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded bg-background/90 p-1 text-foreground shadow-sm hover:bg-red-500 hover:text-white"
          title="Delete"
        >
          <IconTrash size={12} />
        </button>
      </div>
      <div className="pointer-events-none h-full w-full overflow-auto p-3">
        <def.Component node={node}>{childrenRendered}</def.Component>
      </div>
    </div>
  );
};

export const Canvas = () => {
  const draft = useAtomValue(pageDraftAtom);
  const device = useAtomValue(deviceAtom);
  const selectedId = useAtomValue(selectedNodeIdAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);
  const draggedType = useAtomValue(paletteDragTypeAtom);
  const { setLayouts, insertByTypeAt, removeNode, duplicateNode } =
    useBuilderActions();

  const width = widthFor(device);
  const children = draft?.root.children ?? [];
  const layout = useMemo(() => layoutFromNodes(children), [children]);

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const handleCommit = (next: Layout[]) => {
    if (!next.length) return;
    setLayouts(
      next.map((l) => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })),
    );
  };

  const handleDrop = (
    _layoutAfter: Layout[],
    item: Layout,
    _e: Event,
  ) => {
    if (!draggedType) return;
    insertByTypeAt(draft.root.id, children.length, draggedType, {
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    });
  };

  const droppingItem = draggedType
    ? { i: '__placeholder__', ...sizeForType(draggedType) }
    : { i: '__placeholder__', w: 12, h: 4 };

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden bg-muted/30"
      onClick={() => setSelected(null)}
    >
      <ScrollArea className="h-full flex-1">
        <div className="flex w-full justify-center py-8">
          <div
            className={cn(
              'min-h-[600px] rounded-md bg-background shadow-sm transition-all',
              width ? 'border' : 'w-full max-w-5xl border',
            )}
            style={width ? { width: `${width}px` } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <ResponsiveGrid
              className="layout"
              cols={COLS}
              rowHeight={ROW_HEIGHT}
              margin={MARGIN}
              layout={layout}
              onDragStop={handleCommit}
              onResizeStop={handleCommit}
              isDroppable
              droppingItem={droppingItem}
              onDrop={handleDrop}
              draggableHandle=".layout-drag-handle"
              compactType="vertical"
              preventCollision={false}
              useCSSTransforms
            >
              {children.map((c) => (
                <div key={c.id}>
                  <NodeCard
                    node={c}
                    selected={selectedId === c.id}
                    onSelect={() => setSelected(c.id)}
                    onDelete={() => removeNode(c.id)}
                    onDuplicate={() => duplicateNode(c.id)}
                  />
                </div>
              ))}
            </ResponsiveGrid>

            {children.length === 0 ? (
              <div className="pointer-events-none flex h-72 flex-col items-center justify-center text-center text-muted-foreground">
                <div className="text-base font-medium">
                  Drag a component here
                </div>
                <div className="mt-1 text-sm">
                  Pick something from the left palette to start.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
