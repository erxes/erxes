import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { InputDescription } from '../styles';
import {
  ControlLabel,
  FormGroup,
  FormControl
} from 'modules/common/components';

export default class GenerateField extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.state = { value: props.defaultValue }; // eslint-disable-line
  }

  renderSelect(options = [], attrs = {}) {
    return (
      <FormControl componentClass="select" {...attrs}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </FormControl>
    );
  }

  renderInput(attrs) {
    const value = this.state.value;

    if (attrs.componentClass === 'radio') {
      attrs.checked = value === attrs.option;

      attrs.onChange = e => {
        this.onChange(e, attrs.option);
      };
    }

    if (this.props.field.validation === 'date' && value) {
      attrs.value = moment(value).format('YYYY-MM-DD');
    }

    return <FormControl {...attrs} />;
  }

  renderTextarea(attrs) {
    return <FormControl componentClass="textarea" {...attrs} />;
  }

  renderRadioOrCheckInputs(options, type, attrs) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {this.renderInput({ ...attrs, option, componentClass: type })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  /*
   * Handle all types of fields changes
   * @param {Object} e - Event object
   * @param {String} optionValue - per radio button value
   */
  onChange(e, optionValue) {
    const { field, onValueChange } = this.props;
    const { validation } = field;

    let value = optionValue || e.target.value;

    if (validation === 'number') {
      value = Number(value);
    }

    if (onValueChange) {
      this.setState({ value });

      onValueChange({ _id: field._id, value });
    }
  }

  renderControl() {
    const { field } = this.props;
    const { type, validation } = field;
    const options = field.options || [];

    const attrs = {
      id: field._id,
      onChange: this.onChange
    };

    switch (type) {
      case 'select':
        return this.renderSelect(options, attrs);

      case 'check':
        return this.renderRadioOrCheckInputs(options, 'checkbox', attrs);

      case 'radio':
        attrs.name = Math.random().toString();
        return this.renderRadioOrCheckInputs(options, 'radio', attrs);

      case 'textarea':
        return this.renderTextarea(attrs);

      default:
        attrs.value = this.state.value;

        if (validation === 'number') {
          return this.renderInput({ type: 'number', ...attrs });
        }

        if (validation === 'date') {
          return this.renderInput({ type: 'date', ...attrs });
        }

        return this.renderInput({ type: 'text', ...attrs });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <FormGroup>
        <ControlLabel htmlFor={field._id}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </ControlLabel>

        {field.description ? (
          <InputDescription>{field.description}</InputDescription>
        ) : null}

        {this.renderControl()}
      </FormGroup>
    );
  }
}

GenerateField.propTypes = {
  field: PropTypes.object,
  onValueChange: PropTypes.func
};
