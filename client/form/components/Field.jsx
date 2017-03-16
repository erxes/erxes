/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { PropTypes } from 'react';

export default class Field extends React.Component {
  static renderSelect(options = [], attrs = {}) {
    return (
      <select
        {...attrs}
        className="form-control"
      >

        <option />

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

  static renderCheckboxes(name, options, onChange) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {Field.renderInput({ type: 'checkbox', 'data-option': option, name, onChange })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  static renderRadioButtons(name, options, onChange) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {Field.renderInput({ type: 'radio', 'data-option': option, name, onChange })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onRadioButtonsChange = this.onRadioButtonsChange.bind(this);
    this.onCheckboxesChange = this.onCheckboxesChange.bind(this);
    this.onTextAreaChange = this.onTextAreaChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  onChange(value) {
    const { onChange, field } = this.props;

    onChange({ fieldId: field._id, value });
  }

  onInputChange(e) {
    this.onChange(e.target.value);
  }

  onRadioButtonsChange(e) {
    this.onChange(e.target.dataset.option);
  }

  onCheckboxesChange() {
    const values = [];

    document.getElementsByName(this.props.field.name).forEach((checkbox) => {
      if (checkbox.checked) {
        values.push(checkbox.dataset.option);
      }
    });

    this.onChange(values);
  }

  onTextAreaChange(e) {
    this.onChange(e.target.value);
  }

  onSelectChange(e) {
    this.onChange(e.target.value);
  }

  renderControl() {
    const field = this.props.field;
    const options = field.options || [];
    const name = field.name;

    switch (field.type) {
      case 'select':
        return Field.renderSelect(options, { onChange: this.onSelectChange });

      case 'check':
        return Field.renderCheckboxes(name, options, this.onCheckboxesChange);

      case 'radio':
        return Field.renderRadioButtons(name, options, this.onRadioButtonsChange);

      case 'textarea':
        return Field.renderTextarea({ onChange: this.onTextAreaChange });

      default:
        return Field.renderInput({ onChange: this.onInputChange });
    }
  }

  render() {
    const { field, error } = this.props;

    return (
      <div className="form-group">

        <label className="control-label" htmlFor={`field-${field._id}`}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </label>

        {error && error.text}

        {this.renderControl()}
      </div>
    );
  }
}

Field.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  error: PropTypes.object, // eslint-disable-line
  onChange: PropTypes.func,
};
