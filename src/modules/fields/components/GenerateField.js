import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

export default class GenerateField extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  renderSelect(options = [], attrs = {}) {
    return (
      <select {...attrs}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  renderInput(attrs) {
    return <input {...attrs} />;
  }

  renderTextarea(attrs) {
    return <textarea {...attrs} />;
  }

  renderRadioOrCheckInputs(options, type) {
    return (
      <div className="check-control">
        {options.map((option, index) => (
          <div key={index}>
            {this.renderInput({ type })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  onChange(e) {
    const { field, onValueChange } = this.props;
    const { validation } = field;

    let value = e.target.value;

    if (validation === 'number') {
      value = Number(value);
    }

    if (onValueChange) {
      onValueChange({ _id: field._id, value });
    }
  }

  renderControl() {
    const { field, defaultValue } = this.props; // eslint-disable-line
    const { type, validation } = field;
    const options = field.options || [];
    const attrs = { id: field._id, defaultValue, onChange: this.onChange };

    switch (type) {
      case 'select':
        return this.renderSelect(options, attrs);

      case 'check':
        return this.renderRadioOrCheckInputs(options, 'checkbox', attrs);

      case 'radio':
        return this.renderRadioOrCheckInputs(options, 'radio', attrs);

      case 'textarea':
        return this.renderTextarea(attrs);

      default:
        if (validation === 'number') {
          return this.renderInput({ type: 'number', ...attrs });
        }

        if (validation === 'date') {
          if (defaultValue) {
            attrs.defaultValue = moment(defaultValue).format('YYYY-MM-DD');
          }

          return this.renderInput({ type: 'date', ...attrs });
        }

        return this.renderInput({ type: 'text', ...attrs });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <p>
        <label className="control-label" htmlFor={field._id}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </label>

        <span className="description">{field.description}</span>

        {this.renderControl()}
      </p>
    );
  }
}

GenerateField.propTypes = {
  field: PropTypes.object,
  onValueChange: PropTypes.func
};
