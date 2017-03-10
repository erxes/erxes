/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes } from 'react';

export default class Field extends React.Component {
  static renderSelect(options = [], attrs = {}) {
    return (
      <select
        {...attrs}
        className="form-control"
      >

        {options.map((option, index) =>
          <option key={index} value={option}>{option}</option>,
        )}
      </select>
    );
  }

  static renderInput(attrs) {
    return (
      <input
        {...attrs}
        className="form-control"
      />
    );
  }

  static renderTextarea(attrs) {
    return (
      <textarea
        {...attrs}
        className="form-control"
      />
    );
  }

  static renderRadioOrCheckInputs(name, options, type) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {Field.renderInput({ type, name })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.onInputChange = this.onInputChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  onInputChange(e) {
    const { onChange, field } = this.props;

    onChange({ fieldId: field._id, text: field.text, value: e.target.value });
  }

  onSelectChange(e) {
    const { onChange, field } = this.props;

    onChange({ fieldId: field._id, text: field.text, value: e.target.value });
  }

  renderControl() {
    const field = this.props.field;
    const options = field.options || [];
    const name = field.name;

    switch (field.type) {
      case 'select':
        return Field.renderSelect(options);

      case 'input':
        return Field.renderInput({ onChange: this.onInputChange });

      case 'check':
        return Field.renderRadioOrCheckInputs(name, options, 'checkbox');

      case 'radio':
        return Field.renderRadioOrCheckInputs(name, options, 'radio');

      case 'textarea':
        return Field.renderTextarea({});

      default:
        return Field.renderInput({ type: 'text' });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <div className="form-group">

        <label className="control-label" htmlFor={`field-${field._id}`}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </label>

        {this.renderControl()}
      </div>
    );
  }
}

Field.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  onChange: PropTypes.func,
};
