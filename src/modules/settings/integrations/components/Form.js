import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import Common from './Common';

class Form extends Common {
  static getInstallCode(brandCode, formCode) {
    return `
      <script>
        window.erxesSettings = {
          forms: [{
            brand_id: "${brandCode}",
            form_id: "${formCode}",
          }],
        };
        ${Form.installCodeIncludeScript('form')}
      </script>
    `;
  }

  constructor(props, context) {
    super(props, context);

    let code = '';
    const integration = props.integration || {};
    const formData = integration.formData || {};

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || {};
      const form = integration.form || {};

      code = this.constructor.getInstallCode(brand.code, form.code);
    }

    this.state = { code, copied: false, successAction: formData.successAction };

    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleSuccessActionChange = this.handleSuccessActionChange.bind(this);
  }

  updateInstallCodeValue() {
    const brandId = document.getElementById('selectBrand').value;
    const formId = document.getElementById('formId').value;

    if (brandId && formId) {
      const { brands, forms } = this.props;

      const brand = brands.find(brand => brand._id === brandId);
      const form = forms.find(form => form._id === formId);

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

  handleSuccessActionChange() {
    this.setState({
      successAction: document.getElementById('successAction').value
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    const getElementById = id => {
      const element = document.getElementById(id);

      return (element && element.value) || '';
    };

    this.props.save({
      name: document.getElementById('integration-name').value,
      brandId: document.getElementById('selectBrand').value,
      formId: document.getElementById('formId').value,
      languageCode: document.getElementById('languageCode').value,
      formData: {
        loadType: getElementById('loadType'),
        successAction: getElementById('successAction'),
        fromEmail: getElementById('fromEmail'),
        userEmailTitle: getElementById('userEmailTitle'),
        userEmailContent: getElementById('userEmailContent'),
        adminEmails: getElementById('adminEmails').split(','),
        adminEmailTitle: getElementById('adminEmailTitle'),
        adminEmailContent: getElementById('adminEmailContent'),
        thankContent: getElementById('thankContent'),
        redirectUrl: getElementById('redirectUrl')
      }
    });
  }

  renderEmailFields(formData) {
    if (this.state.successAction === 'email') {
      return (
        <div>
          <FormGroup>
            <ControlLabel>From email</ControlLabel>
            <FormControl
              type="text"
              id="fromEmail"
              defaultValue={formData.fromEmail}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>User email title</ControlLabel>
            <FormControl
              type="text"
              id="userEmailTitle"
              defaultValue={formData.userEmailTitle}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>User email content</ControlLabel>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.userEmailContent}
              id="userEmailContent"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Admin emails</ControlLabel>
            <FormControl
              type="text"
              defaultValue={formData.adminEmails}
              id="adminEmails"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Admin email title</ControlLabel>
            <FormControl
              type="text"
              defaultValue={formData.adminEmailTitle}
              id="adminEmailTitle"
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Admin email content</ControlLabel>
            <FormControl
              componentClass="textarea"
              type="text"
              defaultValue={formData.adminEmailContent}
              id="adminEmailContent"
            />
          </FormGroup>
        </div>
      );
    }
  }

  renderRedirectUrl(formData) {
    if (this.state.successAction === 'redirect') {
      return (
        <div>
          <FormGroup>
            <ControlLabel>Redirect url</ControlLabel>
            <FormControl
              type="text"
              defaultValue={formData.redirectUrl}
              id="redirectUrl"
            />
          </FormGroup>
        </div>
      );
    }
  }

  extraContent() {
    const { __ } = this.context;
    const { integration = {} } = this.props;
    const formData = integration.formData || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Form</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select Form')}
            onChange={this.handleFormChange}
            defaultValue={integration.formId}
            id="formId"
          >
            <option />
            {this.props.forms.map(form => (
              <option key={form._id} value={form._id}>
                {form.title}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Load</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={formData.loadType}
            id="loadType"
          >
            <option />
            {this.props.loadTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>On success</ControlLabel>

          <FormControl
            onChange={this.handleSuccessActionChange}
            componentClass="select"
            defaultValue={formData.successAction}
            id="successAction"
          >
            <option />
            {this.props.successActions.map((action, index) => (
              <option key={index} value={action}>
                {action}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {this.renderEmailFields(formData)}
        {this.renderRedirectUrl(formData)}

        <FormGroup>
          <ControlLabel>Thank content</ControlLabel>
          <FormControl
            componentClass="textarea"
            type="text"
            defaultValue={formData.thankContent}
            id="thankContent"
          />
        </FormGroup>
      </div>
    );
  }
}

Form.propTypes = {
  forms: PropTypes.array.isRequired, // eslint-disable-line
  loadTypes: PropTypes.array.isRequired // eslint-disable-line
};

export default Form;
