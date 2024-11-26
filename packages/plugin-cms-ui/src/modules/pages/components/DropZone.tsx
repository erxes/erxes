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
import { Button } from '@erxes/ui/src/components';
// import { any } from './App';

type DropZoneProps = {
  components: any[];
  onReorder: (components: any[]) => void;
  onSelect: (component: any) => void;
};

const SortableItem = ({
  component,
  onClick,
}: {
  component: any;
  onClick: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: component.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ddd',
    padding: '8px',
    marginBottom: '8px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', flex: 1 }}>
        {component.content}
      </div>
      <Button
        btnStyle='link'
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation(); 
          onClick();
        }}
        icon='edit-1'
      />
    </div>
  );
};

const DropZone = ({ components, onReorder, onSelect }: DropZoneProps) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={components.map((comp) => comp.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            minHeight: '100%',
            border: '2px dashed #ccc',
            padding: '16px',
            background: '#f0f0f0',
          }}
        >
          {components.map((component) => (
            <SortableItem
              key={component.id}
              component={component}
              onClick={() => onSelect(component)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DropZone;
