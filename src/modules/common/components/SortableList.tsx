import { Icon } from 'modules/common/components';
import React, { Component, Fragment } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { DragHandler, SortableWrapper, SortItem } from '../styles/sort';
import { reorder } from '../utils';

type Props = {
  fields: any[],
  child: (field: any) => void,
  onChangeFields: (reorderedFields: any ) => void,
  isModal: boolean,
  showDragHandler: boolean | true
};

class SortableList extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    const { destination, source } = result;

    // dropped outside the list
    if (!destination) return;

    if (destination.index === source.index) {
      return;
    }

    const { fields, onChangeFields } = this.props;

    const reorderedFields = reorder(fields, source.index, destination.index);

    onChangeFields(reorderedFields);
  }

  renderDragHandler() {
    if (!this.props.showDragHandler) return null;

    return (
      <DragHandler>
        <Icon icon="move" />
      </DragHandler>
    );
  }

  renderField(field, index) {
    const { child, isModal } = this.props;

    return (
      <Draggable draggableId={field._id} index={index} key={index}>
        {(provided, snapshot) => (
          <Fragment>
            <SortItem
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              isDragging={snapshot.isDragging}
              isModal={isModal}
            >
              {this.renderDragHandler()}

              {child(field)}
            </SortItem>
            {provided.placeholder}
          </Fragment>
        )}
      </Draggable>
    );
  }

  renderFields(provided) {
    const { fields } = this.props;

    return (
      <SortableWrapper innerRef={provided.innerRef}>
        {fields.map((field, index) => this.renderField(field, index))}
      </SortableWrapper>
    );
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppableId" type="ITEMS">
          {provided => this.renderFields(provided)}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default SortableList;
