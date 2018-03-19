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

    const defaultValue = props.defaultValue; // eslint-disable-line

    this.onChange = this.onChange.bind(this);

    this.state = {
      value: defaultValue || '',
      checkBoxValues: defaultValue ? [...defaultValue] : []
    };
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line
    if (nextProps.defaultValue !== this.props.defaultValue) {
      const defaultValue = nextProps.defaultValue || ''; // eslint-disable-line

      this.setState({
        value: defaultValue,
        checkBoxValues: defaultValue ? [...defaultValue] : []
      });
    }
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
    const { value, checkBoxValues } = this.state;
    const { validation, type } = this.props.field;

    attrs.type = 'text';

    attrs.onChange = e => {
      this.setState({ value: e.target.value });
      this.onChange(e, attrs.option);
    };

    if (type === 'radio') {
      attrs.type = 'radio';
      attrs.componentClass = 'radio';
      attrs.checked = value === attrs.option;
    }

    if (type === 'check') {
      attrs.type = 'checkbox';
      attrs.componentClass = 'checkbox';
      attrs.checked = checkBoxValues.includes(attrs.option);
    }

    if (validation === 'date') {
      attrs.type = 'date';

      if (value) {
        attrs.value = moment(value).format('YYYY-MM-DD');
      }
    }

    if (validation === 'number') {
      attrs.type = 'number';
    }

    return <FormControl {...attrs} />;
  }

  renderTextarea(attrs) {
    return <FormControl componentClass="textarea" {...attrs} />;
  }

  renderRadioOrCheckInputs(options, attrs) {
    return (
      <div>
        {options.map((option, index) => (
          <div key={index}>
            {this.renderInput({ ...attrs, option })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  /*
   * Handle all types of fields changes
   * @param {Object} e - Event object
   * @param {String} optionValue - per radio button or checkbox value
   */
  onChange(e, optionValue) {
    const { field, onValueChange } = this.props;
    const { validation, type } = field;

    let value = optionValue || e.target.value;

    if (validation === 'number') {
      value = Number(value);
    }

    if (type === 'check') {
      let checkBoxValues = this.state.checkBoxValues;
      const isChecked = e.target.checked;

      // if selected value is not already in list then add it
      if (isChecked && !checkBoxValues.includes(optionValue)) {
        checkBoxValues.push(optionValue);
      }

      // remove option from checked list
      if (!isChecked) {
        checkBoxValues = checkBoxValues.filter(v => v !== optionValue);
      }

      this.setState({ checkBoxValues });

      value = checkBoxValues;
    }

    if (onValueChange) {
      this.setState({ value });

      onValueChange({ _id: field._id, value });
    }
  }

  renderControl() {
    const { field } = this.props;
    const { type } = field;
    const options = field.options || [];

    const attrs = {
      id: field._id,
      value: this.state.value,
      onChange: this.onChange
    };

    switch (type) {
      case 'select':
        return this.renderSelect(options, attrs);

      case 'check':
        return this.renderRadioOrCheckInputs(options, attrs);

      case 'radio':
        attrs.name = Math.random().toString();
        return this.renderRadioOrCheckInputs(options, attrs);

      case 'textarea':
        return this.renderTextarea(attrs);

      default:
        return this.renderInput(attrs);
    }
  }

  render() {
    const { field } = this.props;

    return (
      <FormGroup>
        <ControlLabel htmlFor={field._id} ignoreTrans>
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
