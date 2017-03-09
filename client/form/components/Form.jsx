import React, { PropTypes } from 'react';

import Field from './Field';

export default class Form extends React.Component {
  renderFields() {
    const fields = this.props.form.fields;

    return fields.map(field => <Field key={field._id} field={field} />);
  }

  render() {
    const { form } = this.props;

    return (
      <div className="erxes-form">
        <h3>{form.title}</h3>
        {this.renderFields()}

        <button type="button" className="btn btn-success">Submit</button>
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
};
