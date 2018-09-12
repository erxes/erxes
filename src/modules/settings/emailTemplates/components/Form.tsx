import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import React, { Fragment } from 'react';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  generateDoc() {
    return {
      doc: {
        name: (document.getElementById('template-name') as HTMLInputElement).value,
        content: (document.getElementById('template-content') as HTMLInputElement).value
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
            defaultValue={emailTemplate.content}
          />
        </FormGroup>
      </Fragment>
    );
  }
}

export default Form;
