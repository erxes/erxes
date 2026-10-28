import { DndContext, DragOverlay } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { ReactNode, useMemo } from 'react';
import { StructureDndStateContext } from '../../contexts/StructureDndStateContext';
import {
  structureCollisionDetection,
  useStructureDnd,
} from '../../hooks/useStructureDnd';
import { StructureDragPreview } from './StructureDragPreview';

const OVERLAY_MODIFIERS = [snapCenterToCursor];

const MEASURING = { droppable: { frequency: 300 } };

export const StructureDndProvider = ({ children }: { children: ReactNode }) => {
  const { sensors, activeItem, copy, onDragStart, onDragEnd, onDragCancel } =
    useStructureDnd();
  const state = useMemo(() => ({ activeItem, copy }), [activeItem, copy]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={structureCollisionDetection}
      measuring={MEASURING}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <StructureDndStateContext.Provider value={state}>
        {children}
      </StructureDndStateContext.Provider>
      <DragOverlay dropAnimation={null} modifiers={OVERLAY_MODIFIERS}>
        {activeItem && <StructureDragPreview item={activeItem} copy={copy} />}
      </DragOverlay>
    </DndContext>
  );
};
