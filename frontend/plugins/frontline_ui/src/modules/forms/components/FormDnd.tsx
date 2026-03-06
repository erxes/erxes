import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
} from '@dnd-kit/core';
import { useSensors } from '@dnd-kit/core';
import { coordinateGetter } from '@/forms/formUtils';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { atom, useAtom } from 'jotai';
import { useFormDnd } from './FormDndProvider';
import { AddStep, FormDndStep } from './FormDndStep';
import { useCollisionDetectionStrategy } from '../hooks/useCollisionDetectionStrategy';

const TRASH_ID = 'void';

const activeIdAtom = atom<UniqueIdentifier | null>(null);

export function FormDnd() {
  const [activeId, setActiveId] = useAtom(activeIdAtom);
  const { steps, setSteps, fields, setFields } = useFormDnd();
  const collisionDetectionStrategy = useCollisionDetectionStrategy({
    activeId,
    fields,
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in fields) {
      return id;
    }

    return Object.keys(fields).find((key) => fields[key].includes(id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;
    if (overId == null || overId === TRASH_ID || active.id in fields) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);
    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      const getNewFields = () => {
        const activeItems = fields[activeContainer];
        const overItems = fields[overContainer];
        const overIndex = overItems.indexOf(overId);
        let newIndex: number;
        if (overId in fields) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;
          const modifier = isBelowOverItem ? 1 : 0;
          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }
        return {
          ...fields,
          [activeContainer]: activeItems.filter((item) => item !== active.id),
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            active.id,
            ...overItems.slice(newIndex, overItems.length),
          ],
        };
      };
      setFields(getNewFields());
    }
    return;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in fields && over?.id) {
      const activeIndex = steps.indexOf(active.id);
      const overIndex = steps.indexOf(over.id);

      const newSteps = arrayMove(steps, activeIndex, overIndex);
      setSteps(newSteps);
    }

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    if (overId === TRASH_ID) {
      const newFields = fields[activeContainer].filter((id) => id !== activeId);
      setFields({ ...fields, [activeContainer]: newFields });
      setActiveId(null);
      return;
    }

    const overContainer = findContainer(overId);

    if (overContainer) {
      const activeIndex = fields[activeContainer].indexOf(active.id);
      const overIndex = fields[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        const newFields = arrayMove(
          fields[overContainer],
          activeIndex,
          overIndex,
        );
        setFields({ ...fields, [overContainer]: newFields });
      }
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={({ active }) => {
        setActiveId(active.id);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="inline-grid grid-flow-row gap-2 w-full">
        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
          {steps.map((step) => (
            <FormDndStep key={step} step={step} />
          ))}

          <AddStep />
        </SortableContext>
      </div>
    </DndContext>
  );
}
