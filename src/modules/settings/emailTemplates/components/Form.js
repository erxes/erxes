import React from 'react';
import { Form as CommonForm } from '../../common/components';
import {
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

class Form extends CommonForm {
  generateDoc() {
    return {
      doc: {
        name: document.getElementById('template-name').value,
        content: document.getElementById('template-content').value,
        formType: 'email-template'
      }
    };
  }

  renderContent(emailTemplate) {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="template-name"
            defaultValue={emailTemplate.name}
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
            onChange={this.onTemplateChange}
            defaultValue={emailTemplate.content}
          />
        </FormGroup>
      </div>
    );
  }
}

export default Form;
