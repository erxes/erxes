import React, { PropTypes } from 'react';

export default class Field extends React.Component {
  static renderSelect(options, attrs = {}) {
    return (
      <select
        {...attrs}
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

  renderControl() {
    const field = this.props.field;

    switch (field.type) {
      case 'select':
        return Field.renderSelect(field.options);

      case 'input':
        return Field.renderInput({});

      case 'textarea':
        return Field.renderTextArea({});

      default:
        return Field.renderInput({ type: 'text' });
    }
  }

  render() {
    const { field } = this.props;

    return (
      <div className="row">
        <span className="control-label col-md-3">{field.text}: </span>

        <div className="col-md-6">
          {this.renderControl()}
        </div>

        <div className="clearfix" />
      </div>
    );
  }
}

Field.propTypes = {
  field: PropTypes.object, // eslint-disable-line
};
