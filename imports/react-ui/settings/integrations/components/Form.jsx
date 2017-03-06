import React, { PropTypes } from 'react';

import {
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import Common from './Common.jsx';

class Form extends Common {
  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      name: document.getElementById('integration-name').value,
      brandId: document.getElementById('selectBrand').value,
      formId: document.getElementById('formId').value,
    });
  }

  extraContent() {
    const integration = this.props.integration || {};

    return (
      <FormGroup controlId="formId">
        <ControlLabel>Form</ControlLabel>

        <FormControl
          componentClass="select"
          placeholder="Select Form"
          defaultValue={integration.formId}
        >

          <option />
          {this.props.forms.map(form =>
            <option key={form._id} value={form._id}>{form.title}</option>,
          )}
        </FormControl>
      </FormGroup>
    );
  }
}

Form.propTypes = {
  forms: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Form;
