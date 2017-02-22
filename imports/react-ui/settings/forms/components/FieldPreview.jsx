/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes } from 'react';

export default class FieldPreview extends React.Component {
  static renderSelect(options = [], attrs = {}) {
    return (
      <select
        {...attrs}
        disabled
        className="form-control"
      >

        {options.map((option, index) =>
          <option key={index} value={option.value}>{option.text}</option>,
        )}
      </select>
    );
  }

  static renderInput(attrs) {
    return (
      <input
        {...attrs}
        disabled
        className="form-control"
      />
    );
  }

  static renderTextarea(attrs) {
    return (
      <textarea
        {...attrs}
        disabled
        className="form-control"
      />
    );
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.field);
  }

  renderControl() {
    const field = this.props.field;

    switch (field.type) {
      case 'select':
        return FieldPreview.renderSelect(field.options);

      case 'input':
        return FieldPreview.renderInput({});

      case 'textarea':
        return FieldPreview.renderTextarea({});

      default:
        return FieldPreview.renderInput({ type: 'text' });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <div className="form-group field-preview" onClick={this.onClick}>
        <label className="control-label" htmlFor={`prew-${field._id}`}>
          {field.text}:
        </label>

        {this.renderControl()}
      </div>
    );
  }
}

FieldPreview.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  onClick: PropTypes.func,
};
