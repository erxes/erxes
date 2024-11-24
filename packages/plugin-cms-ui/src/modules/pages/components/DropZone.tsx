import React from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import { any } from './App';

type DropZoneProps = {
  components: any[];
  onReorder: (components: any[]) => void;
};

const SortableItem = ({ component }: { component: any }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ddd',
    padding: '8px',
    marginBottom: '8px',
    background: '#fff',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {component.content}
    </div>
  );
};

const DropZone = ({ components, onReorder }: DropZoneProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = components.findIndex((comp) => comp.id === active.id);
      const newIndex = components.findIndex((comp) => comp.id === over.id);

      const newOrder = arrayMove(components, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={components.map((comp) => comp.id)} strategy={verticalListSortingStrategy}>
        <div
          style={{
            minHeight: '100%',
            border: '2px dashed #ccc',
            padding: '16px',
            background: '#f0f0f0',
          }}
        >
          {components.map((component) => (
            <SortableItem key={component.id} component={component} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DropZone;
