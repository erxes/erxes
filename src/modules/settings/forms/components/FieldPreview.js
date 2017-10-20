import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class FieldPreview extends Component {
  static renderSelect(options = [], attrs = {}) {
    return (
      <select {...attrs} className="form-control">

        {options.map((option, index) => <option key={index} value={option}>{option}</option>)}
      </select>
    );
  }

  static renderInput(attrs) {
    return <input {...attrs} className="form-control" />;
  }

  static renderTextarea(attrs) {
    return <textarea {...attrs} className="form-control" />;
  }

  static renderRadioOrCheckInputs(options, type) {
    return (
      <div className="check-control">
        {options.map((option, index) => (
          <div key={index}>
            {FieldPreview.renderInput({ type })}
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    this.props.onEdit(this.props.field);
  }

  renderControl() {
    const field = this.props.field;
    const options = field.options || [];

    switch (field.type) {
      case 'select':
        return FieldPreview.renderSelect(options);

      case 'check':
        return FieldPreview.renderRadioOrCheckInputs(options, 'checkbox');

      case 'radio':
        return FieldPreview.renderRadioOrCheckInputs(options, 'radio');

      case 'textarea':
        return FieldPreview.renderTextarea({});

      default:
        return FieldPreview.renderInput({ type: 'text' });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <div className="form-group field-preview" onClick={this.onEdit}>

        <label className="control-label" htmlFor={`prew-${field._id}`}>
          {field.text}
          {field.isRequired ? <span className="required">*</span> : null}:
        </label>

        <span className="description">{field.description}</span>

        {this.renderControl()}
      </div>
    );
  }
}

FieldPreview.propTypes = {
  field: PropTypes.object, // eslint-disable-line
  onEdit: PropTypes.func,
};
