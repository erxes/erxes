import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { IconLayoutGridAdd } from '@tabler/icons-react';
import {
  blocksAtom,
  deviceAtom,
  selectedBlockIdAtom,
} from '../state/builderState';
import { BlockRenderer } from './BlockRenderer';

const DEVICE_WIDTH = {
  desktop: 'max-w-[1280px]',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[390px]',
};

const CanvasDropArea = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop',
    data: { kind: 'canvas' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-full transition-colors ${
        isOver ? 'bg-primary/5' : ''
      }`}
    >
      {children}
    </div>
  );
};

export const BuilderCanvas = () => {
  const blocks = useAtomValue(blocksAtom);
  const device = useAtomValue(deviceAtom);
  const setSelected = useSetAtom(selectedBlockIdAtom);

  const ids = blocks.map((b) => b._id);

  return (
    <div className="flex-1 bg-muted/30 overflow-hidden flex flex-col">
      <ScrollArea className="flex-1">
        <div
          className={`mx-auto my-6 ${DEVICE_WIDTH[device]} px-6 transition-[max-width]`}
        >
          <CanvasDropArea>
            <div
              className="bg-background rounded-lg shadow-sm min-h-[60vh] p-6 md:p-10 space-y-5"
              onClick={() => setSelected(null)}
            >
              <SortableContext
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                {blocks.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-primary/30 py-16 px-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                    <IconLayoutGridAdd size={32} className="opacity-60" />
                    <div className="text-sm font-medium">
                      Drag a block from the left to get started
                    </div>
                    <div className="text-xs">
                      Try a Hero, Posts list, or Heading.
                    </div>
                  </div>
                ) : (
                  blocks.map((b) => (
                    <BlockRenderer key={b._id} block={b} />
                  ))
                )}
              </SortableContext>
            </div>
          </CanvasDropArea>
        </div>
      </ScrollArea>
    </div>
  );
};
