import React, { useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import colors from '../../styles/colors';
import { DragHandler, SortableWrapper, SortItem } from './styles';
import Icon from '../Icon';
import EmptyState from './EmptyState';
import { reorder } from '../utils';

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
      const pattern = new RegExp(searchValue, 'i');
      const index = fields.findIndex((field) => pattern.test(field.label));

      if (index !== -1) {
        const element = document.getElementById(fields[index]._id);

        if (!element) {
          return;
        }

        const parent = ((element.parentNode as HTMLElement)
          .parentNode as HTMLElement).parentNode as HTMLElement;

        if (!parent) {
          return;
        }

        parent.scrollIntoView({ block: 'start' });

        parent.style.filter = 'brightness(90%)';

        setTimeout(() => {
          parent.style.filter = 'brightness(100%)';
        }, 1000);
      }
    }
  }, [fields, searchValue]);

  const onDragEnd = (result) => {
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
        {(provided) => (
          <SortableWrapper
            {...provided.droppableProps}
            innerRef={provided.innerRef}
          >
            {fields.map((field, index) => (
              <Draggable
                id={field._id}
                backgroundColor={colors.colorCoreRed}
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
            ))}
            {provided.placeholder}
          </SortableWrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SortableList;
