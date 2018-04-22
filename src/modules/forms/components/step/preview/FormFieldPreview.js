import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableList } from 'modules/common/components';
import { FieldPreview } from './';

class FormFieldPreview extends Component {
  constructor(props) {
    super(props);

    this.onChangeFields = this.onChangeFields.bind(this);

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

  onChangeFields(reOrderedFields) {
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
    const child = field => {
      return (
        <FieldPreview
          key={field._id}
          onEdit={this.props.onFieldEdit}
          field={field}
        />
      );
    };

    return (
      <SortableList
        child={child}
        fields={this.state.fields}
        onChangeFields={this.onChangeFields}
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
