import { ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from 'erxes-ui';
import { useReportTranslation } from '@/tunable-reports/locales';

const SortableSection = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const { t } = useReportTranslation();
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative min-w-0"
    >
      <div className="absolute left-3 top-4 z-10">
        <DragHandle
          type="button"
          aria-label={`${t('drag')} · ${t('section')}`}
          {...attributes}
          {...listeners}
        />
      </div>
      {children}
    </div>
  );
};
export const SortableSections = <T extends { _id: string }>({
  items,
  move,
  render,
}: {
  items: T[];
  move: (from: number, to: number) => void;
  render: (item: T, index: number) => ReactNode;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = items.findIndex((item) => item._id === active.id);
        const to = items.findIndex((item) => item._id === over.id);
        if (from >= 0 && to >= 0) move(from, to);
      }}
    >
      <SortableContext
        items={items.map((item) => item._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {items.map((item, index) => (
            <SortableSection key={`${item._id}-${index}`} id={item._id}>
              {render(item, index)}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
