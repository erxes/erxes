import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GenerateField } from './';

export default class FieldPreview extends Component {
  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    this.props.onEdit(this.props.field);
  }

  render() {
    const { field } = this.props;

    return (
      <div className="form-group field-preview" onClick={this.onEdit}>
        <GenerateField field={field} />
      </div>
    );
  }
}

FieldPreview.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  onEdit: PropTypes.func
};
