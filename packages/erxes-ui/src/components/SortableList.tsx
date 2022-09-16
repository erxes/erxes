import React, { useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { DragHandler, SortableWrapper, SortItem } from '../styles/sort';
import { reorder } from '../utils/core';
import EmptyState from './EmptyState';
import Icon from './Icon';

type Props = {
  fields: any[];
  child: (field: any) => void;
  onChangeFields: (reorderedFields: any, destinationIndex?: number) => void;
  isModal?: boolean;
  showDragHandler?: boolean | true;
  isDragDisabled?: boolean;
  droppableId?: string;
  emptyMessage?: string;
  searchValue?: string;
};

const SortableList = (props: Props) => {
  const {
    fields,
    child,
    isDragDisabled,
    droppableId = 'droppableId',
    emptyMessage = 'There is no fields',
    searchValue = ''
  } = props;

  useEffect(() => {
    if (searchValue) {
      const patters = new RegExp(searchValue, 'i');
      const index = fields.findIndex(field => patters.test(field.label));
      if (index !== -1) {
        const element = document.getElementById(fields[index]._id);

        element && element.scrollIntoView({ block: 'start' });
      }
    }
  }, [fields, searchValue]);

  const onDragEnd = result => {
    const { destination, source } = result; // dropped outside the list

    if (!destination) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    const { fields, onChangeFields } = props;
    const reorderedFields = reorder(fields, source.index, destination.index);
    onChangeFields(reorderedFields, destination.index);
  };

  const renderDragHandler = () => {
    const { showDragHandler = true } = props;

    if (!showDragHandler) {
      return null;
    }

    return (
      <DragHandler>
        <Icon icon="move" />
      </DragHandler>
    );
  };

  if (fields.length === 0) {
    return <EmptyState text={emptyMessage} icon="ban" />;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId.toString()} type="ITEMS">
        {provided => (
          <SortableWrapper
            {...provided.droppableProps}
            innerRef={provided.innerRef}
          >
            {fields.map((field, index) => (
              <div id={field._id} key={field._id}>
                <Draggable
                  key={field._id || index}
                  draggableId={field._id.toString() || index || Math.random()}
                  index={index}
                  isDragDisabled={isDragDisabled}
                  ref={provided.innerRef}
                >
                  {(dragProvided, snapshot) => (
                    <SortItem
                      innerRef={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                      column={field.column}
                    >
                      {renderDragHandler()}
                      {child(field)}
                    </SortItem>
                  )}
                </Draggable>
              </div>
            ))}
            {provided.placeholder}
          </SortableWrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SortableList;
