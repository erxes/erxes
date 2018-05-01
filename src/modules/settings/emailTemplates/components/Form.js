import React, { Fragment } from 'react';
import {
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  generateDoc() {
    return {
      doc: {
        name: document.getElementById('template-name').value,
        content: document.getElementById('template-content').value
      }
    };
  }

  renderContent(emailTemplate) {
    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

export default Form;
