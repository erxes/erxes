import React from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import { Form as CommonForm } from '../../common/components';

class GroupForm extends CommonForm {
  generateDoc() {
    return {
      doc: {
        name: document.getElementById('group-name').value,
        description: document.getElementById('group-description').value
      }
    };
  }

  renderContent(object) {
    const { name, description } = object._id ? object : {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="group-name" defaultValue={name} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl id="group-description" defaultValue={description} />
        </FormGroup>
      </div>
    );
  }
}

export default GroupForm;
