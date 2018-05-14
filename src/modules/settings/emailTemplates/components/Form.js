import React, { Fragment } from 'react';
import {
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { Form as CommonForm } from '../../common/components';

class Form extends CommonForm {
  generateDoc(doc) {
    return {
      doc: {
        name: doc.templateName,
        content: doc.templateContent
      }
    };
  }

  renderContent(emailTemplate) {
    return (
      <Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="templateName"
            value={emailTemplate.name}
            validations="isValue"
            validationError="Please enter a name"
            type="text"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>

          <FormControl
            name="templateContent"
            validations="isValue"
            validationError="Please enter a content"
            componentClass="textarea"
            rows={5}
            onChange={this.onTemplateChange}
            value={emailTemplate.content}
          />
        </FormGroup>
      </Fragment>
    );
  }
}

export default Form;
