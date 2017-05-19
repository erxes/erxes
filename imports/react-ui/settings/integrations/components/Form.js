import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import { Brands } from '/imports/api/brands/brands';
import { Forms } from '/imports/api/forms/forms';

import Common from './Common';

class Form extends Common {
  static getInstallCode(brandCode, formCode) {
    return `
      <script>
        window.erxesSettings = {
          brand_id: "${brandCode}",
          form_id: "${formCode}"
        };
        ${Form.installCodeIncludeScript('form')}
      </script>
    `;
  }

  constructor(props, context) {
    super(props, context);

    let code = '';

    // showed install code automatically in edit mode
    if (props.integration) {
      const brand = Brands.findOne(props.integration.brandId);
      const form = Forms.findOne(props.integration.formId);

      code = this.constructor.getInstallCode(brand.code, form.code);
    }

    this.state = { code, copied: false };

    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  updateInstallCodeValue() {
    const brandId = document.getElementById('selectBrand').value;
    const formId = document.getElementById('formId').value;

    if (brandId && formId) {
      const brand = Brands.findOne(brandId);
      const form = Forms.findOne(formId);
      const code = this.constructor.getInstallCode(brand.code, form.code);

      this.setState({ code, copied: false });
    }
  }

  handleBrandChange() {
    this.updateInstallCodeValue();
  }

  handleFormChange() {
    this.updateInstallCodeValue();
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      mainDoc: {
        name: document.getElementById('integration-name').value,
        brandId: document.getElementById('selectBrand').value,
        formId: document.getElementById('formId').value,
      },

      formDoc: {
        loadType: document.getElementById('loadType').value,
        successAction: document.getElementById('successAction').value,
        emailTitle: document.getElementById('emailTitle').value,
        emailContent: document.getElementById('emailContent').value,
        thankContent: document.getElementById('thankContent').value,
        redirectUrl: document.getElementById('redirectUrl').value,
      },
    });
  }

  extraContent() {
    const integration = this.props.integration || {};
    const formData = integration.formData || {};

    return (
      <div>
        <FormGroup controlId="formId">
          <ControlLabel>Form</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder="Select Form"
            onChange={this.handleFormChange}
            defaultValue={integration.formId}
          >

            <option />
            {this.props.forms.map(form => (
              <option key={form._id} value={form._id}>{form.title}</option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup controlId="loadType">
          <ControlLabel>Load</ControlLabel>

          <FormControl componentClass="select" defaultValue={formData.loadType}>

            <option />
            {this.props.loadTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup controlId="successAction">
          <ControlLabel>On success</ControlLabel>

          <FormControl componentClass="select" defaultValue={formData.successAction}>

            <option />
            {this.props.successActions.map((action, index) => (
              <option key={index} value={action}>{action}</option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup controlId="emailTitle">
          <ControlLabel>Email title</ControlLabel>
          <FormControl type="text" defaultValue={formData.emailTitle} />
        </FormGroup>

        <FormGroup controlId="emailContent">
          <ControlLabel>Email content</ControlLabel>
          <FormControl componentClass="textarea" type="text" defaultValue={formData.emailContent} />
        </FormGroup>

        <FormGroup controlId="redirectUrl">
          <ControlLabel>Redirect url</ControlLabel>
          <FormControl type="text" defaultValue={formData.redirectUrl} />
        </FormGroup>

        <FormGroup controlId="thankContent">
          <ControlLabel>Thank content</ControlLabel>
          <FormControl componentClass="textarea" type="text" defaultValue={formData.thankContent} />
        </FormGroup>
      </div>
    );
  }
}

Form.propTypes = {
  forms: PropTypes.array.isRequired, // eslint-disable-line
  loadTypes: PropTypes.array.isRequired, // eslint-disable-line
};

export default Form;
