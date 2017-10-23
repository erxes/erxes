import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  generateDoc() {
    return {
      doc: {
        title: document.getElementById('form-title').value,
        description: document.getElementById('form-description').value
      }
    };
  }

  renderContent(form) {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="form-title"
            type="text"
            defaultValue={form.title}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="form-description"
            componentClass="textarea"
            defaultValue={form.description}
            required
            rows={5}
          />
        </FormGroup>
      </div>
    );
  }
}

export default Form;
