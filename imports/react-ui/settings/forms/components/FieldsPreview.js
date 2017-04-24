import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { EmptyState } from '/imports/react-ui/common';
import FieldPreview from './FieldPreview';

const DragHandle = SortableHandle(() => <span className="drag-handler">::::</span>);

const FieldPreviewWrapper = props => (
  <div className="draggable-field">
    <DragHandle />
    <FieldPreview {...props} />
  </div>
);

const SortableItem = SortableElement(FieldPreviewWrapper);

const SortableList = SortableContainer(({ fields, onEdit }) => (
  <div className="form-preview">
    {fields.map((field, index) => (
      <SortableItem key={`item-${index}`} index={index} field={field} onEdit={onEdit} />
    ))}

    {fields.length == 0
      ? <EmptyState icon={<i className="ion-clipboard" />} text="No items" size="small" />
      : null}
  </div>
));

class FieldsPreview extends Component {
  constructor(props) {
    super(props);

    this.onSortEnd = this.onSortEnd.bind(this);

    this.state = {
      fields: props.fields,
    };
  }

  componentWillUpdate(nextProps) {
    if (this.state.fields.length !== nextProps.fields.length) {
      this.setState({
        fields: nextProps.fields,
      });
    }
  }

  onSortEnd({ oldIndex, newIndex }) {
    const reorderedFields = arrayMove(this.state.fields, oldIndex, newIndex);

    this.setState({
      fields: reorderedFields,
    });

    this.props.onSort(reorderedFields);
  }

  render() {
    return (
      <SortableList
        fields={this.state.fields}
        onEdit={this.props.onFieldEdit}
        onSortEnd={this.onSortEnd}
        useDragHandle
      />
    );
  }
}

FieldsPreview.propTypes = {
  fields: PropTypes.array.isRequired, // eslint-disable-line
  onFieldEdit: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
};

export default FieldsPreview;
