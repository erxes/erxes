import { useDroppable } from '@dnd-kit/core';
import { useAtomValue, useSetAtom } from 'jotai';
import { ScrollArea, cn } from 'erxes-ui';
import {
  deviceAtom,
  pageDraftAtom,
  selectedNodeIdAtom,
} from '../states/builderStates';
import { CanvasNode } from './CanvasNode';

const widthFor = (mode: 'desktop' | 'tablet' | 'mobile') =>
  mode === 'mobile' ? 375 : mode === 'tablet' ? 768 : null;

export const Canvas = () => {
  const draft = useAtomValue(pageDraftAtom);
  const device = useAtomValue(deviceAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);

  const width = widthFor(device);
  const rootId = draft?.root.id ?? 'no-root';

  const { setNodeRef, isOver } = useDroppable({
    id: `inside:${rootId}`,
    data: { kind: 'inside', parentId: rootId },
  });

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden bg-muted/30"
      onClick={() => setSelected(null)}
    >
      <ScrollArea className="h-full flex-1">
        <div className="flex w-full justify-center py-8">
          <div
            className={cn(
              'min-h-[600px] rounded-md bg-background p-6 shadow-sm transition-all',
              width ? 'border' : 'w-full max-w-5xl border',
            )}
            style={width ? { width: `${width}px` } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {draft.root.children && draft.root.children.length > 0 ? (
              <CanvasNode node={draft.root} parentId={null} index={0} />
            ) : (
              <div
                ref={setNodeRef}
                className={cn(
                  'flex h-72 flex-col items-center justify-center rounded-md border-2 border-dashed text-center',
                  isOver
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                <div className="text-base font-medium">
                  Drag a component here
                </div>
                <div className="mt-1 text-sm">
                  Pick something from the left palette to start.
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
