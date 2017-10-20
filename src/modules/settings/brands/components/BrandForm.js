import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Form as CommonForm } from '../../common/components';

class BrandForm extends CommonForm {
  generateDoc() {
    return {
      doc: {
        name: document.getElementById('brand-name').value,
        description: document.getElementById('brand-description').value,
      },
    };
  }

  renderContent(brand) {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="brand-name" type="text" defaultValue={brand.name} required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="brand-description"
            componentClass="textarea"
            defaultValue={brand.description}
            required
            rows={5}
          />
        </FormGroup>
      </div>
    );
  }
}

export default BrandForm;
