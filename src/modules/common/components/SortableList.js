import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Icon } from 'modules/common/components';
import { SortableWrapper, SortItem, DragHandler } from '../styles/sort';
import { reorder } from '../utils';

const propTypes = {
  fields: PropTypes.array,
  child: PropTypes.func,
  onChangeFields: PropTypes.func,
  isModal: PropTypes.bool,
  showDragHandler: PropTypes.bool
};

const defaultProps = {
  showDragHandler: true
};

class SortableList extends Component {
  constructor(props) {
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
    if (!this.props.showDragHandler) return;

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

SortableList.propTypes = propTypes;
SortableList.defaultProps = defaultProps;

export default SortableList;
