import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import { Brands } from '/imports/api/brands/brands';
import { KbGroups } from '/imports/api/knowledgebase/collections';

import Common from './Common';

class KbGroup extends Common {
  static getInstallCode(brandCode, formCode) {
    return `
      <script>
        window.erxesSettings = {
          
        };
        ${KbGroup.installCodeIncludeScript('form')}
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
      const brand = Brands.findOne(integration.brandId);
      const form = KbGroup.findOne(integration.formId);

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

  handleSuccessActionChange() {
    this.setState({
      successAction: document.getElementById('successAction').value,
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
      mainDoc: {
        name: document.getElementById('integration-name').value,
        brandId: document.getElementById('selectBrand').value,
        formId: document.getElementById('formId').value,
      },

      formDoc: {
        loadType: getElementById('loadType'),
        successAction: getElementById('successAction'),
        fromEmail: getElementById('fromEmail'),
        userEmailTitle: getElementById('userEmailTitle'),
        userEmailContent: getElementById('userEmailContent'),
        adminEmails: getElementById('adminEmails').split(','),
        adminEmailTitle: getElementById('adminEmailTitle'),
        adminEmailContent: getElementById('adminEmailContent'),
        thankContent: getElementById('thankContent'),
        redirectUrl: getElementById('redirectUrl'),
      },
    });
  }
}

KbGroup.propTypes = {
  forms: PropTypes.array.isRequired, // eslint-disable-line
  loadTypes: PropTypes.array.isRequired, // eslint-disable-line
};

export default KbGroup;
