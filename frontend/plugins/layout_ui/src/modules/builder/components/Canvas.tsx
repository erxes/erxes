import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Moveable, {
  OnDrag,
  OnDragGroup,
  OnResize,
  OnResizeGroup,
} from 'react-moveable';
import Selecto from 'react-selecto';
import { ScrollArea, cn } from 'erxes-ui';

import {
  CANVAS_HEIGHT_MIN,
  CANVAS_WIDTH,
  BuilderNode,
  Frame,
} from '../types';
import {
  deviceAtom,
  pageDraftAtom,
  paletteDragTypeAtom,
  selectedNodeIdsAtom,
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { getDef } from '../elements/registry';

const TARGET_ATTR = 'data-builder-id';

const sortedByZ = (nodes: BuilderNode[]): BuilderNode[] =>
  [...nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

// Figma-style: tiny corner dots, invisible edge hit zones (cursor only),
// thin selection line. Overrides react-moveable's chunky defaults.
const MOVEABLE_STYLES = `
.layout-builder-moveable .moveable-line {
  background: hsl(var(--primary)) !important;
  height: 1px !important;
  width: 1px;
}
.layout-builder-moveable .moveable-control {
  width: 9px !important;
  height: 9px !important;
  margin-top: -5px !important;
  margin-left: -5px !important;
  background: #ffffff !important;
  border: 1.5px solid hsl(var(--primary)) !important;
  border-radius: 1px !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18) !important;
  opacity: 1;
}
.layout-builder-moveable .moveable-control.moveable-direction.moveable-n,
.layout-builder-moveable .moveable-control.moveable-direction.moveable-e,
.layout-builder-moveable .moveable-control.moveable-direction.moveable-s,
.layout-builder-moveable .moveable-control.moveable-direction.moveable-w {
  width: 14px !important;
  height: 14px !important;
  margin-top: -7px !important;
  margin-left: -7px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
.layout-builder-moveable .moveable-rotation {
  display: none !important;
}
`;

const NodeBox = ({ node }: { node: BuilderNode }) => {
  const def = getDef(node.type);
  if (!def) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component <code className="ml-1">{node.type}</code>
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
    <div className="pointer-events-none h-full w-full">
      <def.Component node={node}>{childrenRendered}</def.Component>
    </div>
  );
};

export const Canvas = () => {
  const draft = useAtomValue(pageDraftAtom);
  const device = useAtomValue(deviceAtom);
  const selectedIds = useAtomValue(selectedNodeIdsAtom);
  const setSelectedIds = useSetAtom(selectedNodeIdsAtom);
  const draggedType = useAtomValue(paletteDragTypeAtom);
  const { setFrames, insertByTypeAtFrame, removeMany } = useBuilderActions();

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const moveableRef = useRef<Moveable | null>(null);
  const selectoRef = useRef<Selecto | null>(null);
  const frameSnapshot = useRef(new Map<string, Frame>());
  const [hoverDrop, setHoverDrop] = useState(false);
  const [targets, setTargets] = useState<HTMLElement[]>([]);
  const [guidelines, setGuidelines] = useState<HTMLElement[]>([]);

  const children = draft?.root.children ?? [];
  const ordered = useMemo(() => sortedByZ(children), [children]);
  const canvasWidth = CANVAS_WIDTH[device];
  const canvasHeight = useMemo(() => {
    const max = ordered
      .filter((n) => n.frame)
      .reduce((acc, n) => {
        const f = n.frame!;
        return Math.max(acc, f.y + (f.h ?? 200) + 80);
      }, 0);
    return Math.max(CANVAS_HEIGHT_MIN, max);
  }, [ordered]);

  // Recompute Moveable targets and guidelines after the DOM updates.
  // Use functional setState with reference-equality short-circuit so we never
  // trigger a re-render when the resolved DOM nodes haven't actually changed.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const same = (a: HTMLElement[], b: HTMLElement[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    };
    if (!surface) {
      setTargets((prev) => (prev.length === 0 ? prev : []));
      setGuidelines((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const all = Array.from(
      surface.querySelectorAll<HTMLElement>(`[${TARGET_ATTR}]`),
    );
    const sel: HTMLElement[] = [];
    const others: HTMLElement[] = [];
    for (const el of all) {
      const id = el.getAttribute(TARGET_ATTR);
      if (id && selectedIds.includes(id)) sel.push(el);
      else others.push(el);
    }
    let changed = false;
    setTargets((prev) => {
      if (same(prev, sel)) return prev;
      changed = true;
      return sel;
    });
    setGuidelines((prev) => {
      if (same(prev, others)) return prev;
      changed = true;
      return others;
    });
    if (changed) moveableRef.current?.updateRect();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedIds.length) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeMany(selectedIds);
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const arrow: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const delta = arrow[e.key];
      if (!delta) return;
      e.preventDefault();
      if (!draft) return;
      const updates = selectedIds
        .map((id) => {
          const n = draft.root.children?.find((c) => c.id === id);
          if (!n?.frame) return null;
          return {
            id,
            x: n.frame.x + delta[0],
            y: n.frame.y + delta[1],
          };
        })
        .filter((u): u is { id: string; x: number; y: number } => !!u);
      if (updates.length) setFrames(updates);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, removeMany, draft, setFrames]);

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const idOfTarget = (el: HTMLElement | SVGElement): string | null =>
    (el as HTMLElement).getAttribute(TARGET_ATTR);

  const captureSnapshot = () => {
    frameSnapshot.current.clear();
    for (const id of selectedIds) {
      const n = children.find((c) => c.id === id);
      const el = surfaceRef.current?.querySelector<HTMLElement>(
        `[${TARGET_ATTR}="${id}"]`,
      );
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const explicit = n?.frame ?? { x: 0, y: 0 };
      // Always seed snapshot with measured size so resize handles work
      // even when the node has no explicit width/height yet.
      frameSnapshot.current.set(id, {
        x: explicit.x,
        y: explicit.y,
        w: explicit.w ?? rect.width,
        h: explicit.h ?? rect.height,
      });
    }
  };

  const handleDragSingle = ({ target, beforeTranslate }: OnDrag) => {
    // beforeTranslate is the absolute translate (we seeded Moveable with the
    // node's frame.x/y on dragStart), so write it as-is.
    (target as HTMLElement).style.transform =
      `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
  };

  const handleResizeSingle = ({
    target,
    width,
    height,
    drag,
  }: OnResize) => {
    (target as HTMLElement).style.width = `${width}px`;
    (target as HTMLElement).style.height = `${height}px`;
    (target as HTMLElement).style.transform =
      `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
  };

  const seedMoveableTranslate = (
    target: HTMLElement | SVGElement,
    set: (translate: number[]) => void,
  ) => {
    const id = idOfTarget(target);
    if (!id) return;
    const n = children.find((c) => c.id === id);
    const f = n?.frame;
    if (!f) return;
    set([f.x, f.y]);
  };

  const commitMoveOnly = () => {
    const updates: Array<{ id: string; x: number; y: number }> = [];
    for (const id of selectedIds) {
      const el = surfaceRef.current?.querySelector<HTMLElement>(
        `[${TARGET_ATTR}="${id}"]`,
      );
      if (!el) continue;
      const start = frameSnapshot.current.get(id);
      if (!start) continue;
      const m = el.style.transform.match(
        /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/,
      );
      const x = m ? Math.round(parseFloat(m[1])) : start.x;
      const y = m ? Math.round(parseFloat(m[2])) : start.y;
      updates.push({ id, x, y });
    }
    if (updates.length) setFrames(updates);
    frameSnapshot.current.clear();
  };

  const commitResize = () => {
    const updates: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];
    for (const id of selectedIds) {
      const el = surfaceRef.current?.querySelector<HTMLElement>(
        `[${TARGET_ATTR}="${id}"]`,
      );
      if (!el) continue;
      const start = frameSnapshot.current.get(id);
      if (!start) continue;
      const m = el.style.transform.match(
        /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/,
      );
      const x = m ? Math.round(parseFloat(m[1])) : start.x;
      const y = m ? Math.round(parseFloat(m[2])) : start.y;
      const w = el.style.width
        ? Math.round(parseFloat(el.style.width))
        : start.w ?? el.offsetWidth;
      const h = el.style.height
        ? Math.round(parseFloat(el.style.height))
        : start.h ?? el.offsetHeight;
      updates.push({ id, x, y, w, h });
    }
    if (updates.length) setFrames(updates);
    frameSnapshot.current.clear();
  };

  const handleDropPalette = (e: React.DragEvent) => {
    e.preventDefault();
    setHoverDrop(false);
    const type = draggedType ?? e.dataTransfer.getData('text/plain');
    if (!type) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const x = Math.max(0, Math.round(e.clientX - rect.left - 30));
    const y = Math.max(0, Math.round(e.clientY - rect.top - 15));
    insertByTypeAtFrame(draft.root.id, type, { x, y });
  };

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden bg-[hsl(var(--canvas-bg,210_15%_92%))]"
      style={
        {
          // Soft warm-gray workspace, easier on the eyes than stark white.
          ['--canvas-bg' as string]: '220 13% 91%',
        } as React.CSSProperties
      }
      onClick={() => {
        setSelectedIds([]);
      }}
    >
      <style>{MOVEABLE_STYLES}</style>
      <ScrollArea className="h-full flex-1">
        <div className="flex w-full justify-center py-6">
          <div
            className={cn(
              'relative text-card-foreground shadow-sm transition',
              !draft.background && 'bg-card',
              hoverDrop && 'ring-2 ring-primary',
            )}
            style={{
              width: canvasWidth,
              minHeight: canvasHeight,
              background: draft.background,
            }}
            onClick={(e) => e.stopPropagation()}
            onDragOver={(e) => {
              if (
                draggedType ||
                e.dataTransfer.types.includes('text/plain')
              ) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setHoverDrop(true);
              }
            }}
            onDragLeave={() => setHoverDrop(false)}
            onDrop={handleDropPalette}
          >
            <div ref={surfaceRef} className="relative h-full w-full">
              {ordered.map((c) => {
                if (c.hidden) return null;
                const f = c.frame ?? { x: 0, y: 0 };
                const isSelected = selectedIds.includes(c.id);
                const padTop = c.style?.paddingTop;
                const padRight = c.style?.paddingRight;
                const padBottom = c.style?.paddingBottom;
                const padLeft = c.style?.paddingLeft;
                return (
                  <div
                    key={c.id}
                    {...{ [TARGET_ATTR]: c.id }}
                    className={cn(
                      'canvas-target absolute box-border outline-1 -outline-offset-1',
                      c.locked
                        ? 'cursor-not-allowed'
                        : 'cursor-move select-none',
                      isSelected
                        ? 'outline outline-primary'
                        : 'outline-transparent hover:outline-primary/40',
                    )}
                    style={{
                      transform: `translate(${f.x}px, ${f.y}px)`,
                      width: f.w,
                      height: f.h,
                      zIndex: c.zIndex ?? 0,
                      paddingTop: padTop,
                      paddingRight: padRight,
                      paddingBottom: padBottom,
                      paddingLeft: padLeft,
                    }}
                  >
                    <NodeBox node={c} />
                  </div>
                );
              })}

              <Moveable
                ref={moveableRef}
                className="layout-builder-moveable"
                target={targets}
                draggable
                resizable
                throttleDrag={0}
                throttleResize={0}
                origin={false}
                edge={false}
                renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
                snappable
                snapDirections={{
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  center: true,
                  middle: true,
                }}
                elementSnapDirections={{
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  center: true,
                  middle: true,
                }}
                snapThreshold={5}
                elementGuidelines={guidelines}
                bounds={{
                  left: 0,
                  top: 0,
                  right: canvasWidth,
                  bottom: canvasHeight,
                }}
                onDragStart={(e) => {
                  captureSnapshot();
                  seedMoveableTranslate(e.target, e.set);
                }}
                onDrag={handleDragSingle}
                onDragEnd={commitMoveOnly}
                onResizeStart={(e) => {
                  captureSnapshot();
                  if (e.dragStart) {
                    seedMoveableTranslate(e.target, e.dragStart.set);
                  }
                }}
                onResize={handleResizeSingle}
                onResizeEnd={commitResize}
                onDragGroupStart={(e) => {
                  captureSnapshot();
                  for (const ev of e.events) {
                    seedMoveableTranslate(ev.target, ev.set);
                  }
                }}
                onDragGroup={({ events }: OnDragGroup) => {
                  for (const ev of events) handleDragSingle(ev);
                }}
                onDragGroupEnd={commitMoveOnly}
                onResizeGroupStart={(e) => {
                  captureSnapshot();
                  for (const ev of e.events) {
                    if (ev.dragStart) {
                      seedMoveableTranslate(ev.target, ev.dragStart.set);
                    }
                  }
                }}
                onResizeGroup={({ events }: OnResizeGroup) => {
                  for (const ev of events) handleResizeSingle(ev);
                }}
                onResizeGroupEnd={commitResize}
              />
            </div>

            <Selecto
              ref={selectoRef}
              dragContainer={surfaceRef.current ?? undefined}
              selectableTargets={[`[${TARGET_ATTR}]`]}
              hitRate={0}
              selectByClick
              selectFromInside={false}
              ratio={0}
              toggleContinueSelect={['shift']}
              onDragStart={(e) => {
                const moveable = moveableRef.current;
                const target = e.inputEvent.target as HTMLElement;
                if (moveable && moveable.isMoveableElement(target)) {
                  e.stop();
                  return;
                }
                if (
                  targets.some((t) => t === target || t.contains(target))
                ) {
                  e.stop();
                }
              }}
              onSelect={(e) => {
                const ids = e.selected
                  .map((el) =>
                    (el as HTMLElement).getAttribute(TARGET_ATTR),
                  )
                  .filter((x): x is string => !!x);
                setSelectedIds(ids);
              }}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
