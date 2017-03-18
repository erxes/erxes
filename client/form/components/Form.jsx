import _ from 'underscore';
import React, { PropTypes } from 'react';

import Field from './Field';

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onFieldValueChange = this.onFieldValueChange.bind(this);

    const doc = {};

    _.each(this.props.form.fields, (field) => {
      doc[field._id] = { text: field.text, type: field.type, value: '' };
    });

    this.state = { doc };
  }

  onFieldValueChange({ fieldId, value }) {
    const doc = this.state.doc;

    doc[fieldId].value = value;

    this.setState({ doc });
  }

  onSubmit() {
    this.props.onSubmit(this.state.doc);
  }

  renderFields() {
    const { form, submitResponse } = this.props;
    const fields = form.fields;
    const errors = submitResponse.errors || [];

    return fields.map((field) => {
      const fieldError = errors.find(error => error.fieldId === field._id);

      return (
        <Field
          key={field._id}
          field={field}
          error={fieldError}
          onChange={this.onFieldValueChange}
        />
      );
    });
  }

  render() {
    const { form } = this.props;

    return (
      <div>
        <h3>{form.title}</h3>
        {this.renderFields()}

        <button
          type="button"
          onClick={this.onSubmit}
          className="btn btn-success"
        >
          Submit
        </button>
      </div>
    );
  }
}

Form.propTypes = {
  form: PropTypes.shape({
    title: PropTypes.string,

    fields: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      check: PropTypes.string,
      text: PropTypes.string,
      description: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string),
      isRequired: PropTypes.bool,
      order: PropTypes.number,
    })),
  }),

  submitResponse: PropTypes.shape({
    status: PropTypes.string,

    errors: PropTypes.arrayOf(PropTypes.shape({
      fieldId: PropTypes.string,
      code: PropTypes.string,
      text: PropTypes.string,
    })),
  }),

  onSubmit: PropTypes.func,
};
