import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc';
import { Icon } from 'modules/common/components';
import { SortableWrapper, SortItem, DragHandler } from '../styles/sort';

const DragHandle = SortableHandle(() => (
  <DragHandler>
    <Icon icon="android-more-vertical" />
  </DragHandler>
));

const SortableItem = SortableElement(({ child }) => (
  <SortItem>
    <DragHandle />
    {child}
  </SortItem>
));

const Sortable = SortableContainer(({ fields, child }) => {
  console.log('fields: ', fields);
  return (
    <SortableWrapper>
      {fields.map((field, index) => (
        <SortableItem key={index} index={index} child={child(field)} />
      ))}
    </SortableWrapper>
  );
});

const propTypes = {
  fields: PropTypes.array,
  child: PropTypes.func,
  onChangeFields: PropTypes.func
};

class SortableList extends Component {
  constructor(props) {
    super(props);

    this.onSortEnd = this.onSortEnd.bind(this);
  }

  onSortEnd({ oldIndex, newIndex }) {
    const reOrderedFields = arrayMove(this.props.fields, oldIndex, newIndex);
    console.log('reOrderedFields: ', reOrderedFields);
    this.props.onChangeFields(reOrderedFields);
  }

  render() {
    const extendedProps = {
      ...this.props,
      onSortEnd: this.onSortEnd
    };

    return <Sortable {...extendedProps} />;
  }
}

SortableList.propTypes = propTypes;

export default SortableList;
