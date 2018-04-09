import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove
} from 'react-sortable-hoc';
import { Icon } from 'modules/common/components';
import { PreviewForm, DragableItem, DragHandler } from '../style';
import { FieldPreview } from './';

const DragHandle = SortableHandle(() => (
  <DragHandler>
    <Icon icon="arrow-move" />
  </DragHandler>
));

const FieldPreviewWrapper = props => (
  <DragableItem>
    <DragHandle />
    <FieldPreview {...props} />
  </DragableItem>
);

const SortableItem = SortableElement(FieldPreviewWrapper);

const SortableList = SortableContainer(({ fields, onEdit }) => (
  <PreviewForm>
    {fields.map((field, index) => (
      <SortableItem
        key={`item-${index}`}
        index={index}
        field={field}
        onEdit={onEdit}
      />
    ))}
  </PreviewForm>
));

class FormFieldPreview extends Component {
  constructor(props) {
    super(props);

    this.onSortEnd = this.onSortEnd.bind(this);

    this.state = {
      fields: props.fields
    };
  }

  componentWillUpdate(nextProps) {
    if (this.state.fields.length !== nextProps.fields.length) {
      this.setState({
        fields: nextProps.fields
      });
    }
  }

  onSortEnd({ oldIndex, newIndex }) {
    const reOrderedFields = arrayMove(this.state.fields, newIndex, oldIndex);
    const fields = [];

    reOrderedFields.forEach((field, index) => {
      fields.push({
        ...field,
        order: index
      });
    });

    this.setState({ fields });

    this.props.onChange('fields', this.state.fields);
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

FormFieldPreview.propTypes = {
  fields: PropTypes.array, // eslint-disable-line
  onFieldEdit: PropTypes.func,
  onChange: PropTypes.func
};

export default FormFieldPreview;
