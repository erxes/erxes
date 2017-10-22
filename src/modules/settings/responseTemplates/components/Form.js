import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  generateDoc() {
    return {
      doc: {
        brandId: document.getElementById('template-brand-id').value,
        name: document.getElementById('template-name').value,
        content: document.getElementById('template-content').value
      }
    };
  }

  renderContent(resTemplate) {
    const { brands } = this.props;

    return (
      <div>
        <FormGroup controlId="template-brand-id">
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder="Select Brand"
            defaultValue={resTemplate.brandId}
          >
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            id="template-name"
            defaultValue={resTemplate.name}
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>

          <FormControl
            id="template-content"
            componentClass="textarea"
            rows={5}
            defaultValue={resTemplate.content}
          />
        </FormGroup>
      </div>
    );
  }
}

export default Form;
