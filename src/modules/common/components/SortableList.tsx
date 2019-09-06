import Icon from 'modules/common/components/Icon';
import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { DragHandler, SortableWrapper, SortItem } from '../styles/sort';
import { reorder } from '../utils';

type Props = {
  fields: any[];
  child: (field: any) => void;
  onChangeFields: (reorderedFields: any) => void;
  isModal?: boolean;
  showDragHandler?: boolean | true;
  isDragDisabled?: boolean;
};

class SortableList extends React.Component<Props> {
  onDragEnd = result => {
    const { destination, source } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    const { fields, onChangeFields } = this.props;

    const reorderedFields = reorder(fields, source.index, destination.index);

    onChangeFields(reorderedFields);
  };

  renderDragHandler() {
    const { showDragHandler = true } = this.props;

    if (!showDragHandler) {
      return null;
    }

    return (
      <DragHandler>
        <Icon icon="ellipsis-v" />
      </DragHandler>
    );
  }

  render() {
    const { fields, child, isDragDisabled } = this.props;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppableId-1" type="ITEMS">
          {provided => (
            <SortableWrapper
              {...provided.droppableProps}
              innerRef={provided.innerRef}
            >
              {fields.map((field, index) => (
                <Draggable
                  key={field._id}
                  draggableId={field._id}
                  index={index}
                  isDragDisabled={isDragDisabled}
                >
                  {(dragProvided, snapshot) => (
                    <SortItem
                      innerRef={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    >
                      {this.renderDragHandler()}
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
  }
}

export default SortableList;
