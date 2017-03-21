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
      formLoadType: document.getElementById('formLoadType').value,
    });
  }

  extraContent() {
    const integration = this.props.integration || {};

    return (
      <div>
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

        <FormGroup controlId="formLoadType">
          <ControlLabel>Load</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={integration.formLoadType}
          >

            <option />
            {this.props.loadTypes.map((type, index) =>
              <option key={index} value={type}>{type}</option>,
            )}
          </FormControl>
        </FormGroup>
      </div>
    );
  }
}

Form.propTypes = {
  forms: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  loadTypes: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Form;
