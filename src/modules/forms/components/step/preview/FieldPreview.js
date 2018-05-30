import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GenerateField } from 'modules/settings/properties/components';
import { FieldItem } from './styles';

class FieldPreview extends Component {
  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    const onEdit = this.props.onEdit || (() => {});

    onEdit(this.props.field);
  }

  render() {
    const { field } = this.props;

    return (
      <FieldItem onClick={this.onEdit}>
        <GenerateField field={field} />
      </FieldItem>
    );
  }
}

FieldPreview.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  onEdit: PropTypes.func
};

export default FieldPreview;
