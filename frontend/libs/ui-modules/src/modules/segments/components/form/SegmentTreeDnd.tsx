import { DndContext, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSegmentTreeDnd } from '../../hooks/useSegmentTreeDnd';

export const SegmentTreeDnd = ({ children }: { children: React.ReactNode }) => {
  const { sensors, handleDragEnd, version } = useSegmentTreeDnd();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div key={version}>{children}</div>
    </DndContext>
  );
};
