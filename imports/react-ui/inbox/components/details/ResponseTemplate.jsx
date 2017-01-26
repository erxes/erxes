import { _ } from 'meteor/underscore';
import Alert from 'meteor/erxes-notifier';
import React, { PropTypes, Component } from 'react';
import {
  Modal,
  ButtonToolbar,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';

import { add } from '/imports/api/responseTemplates/methods';
import { ModalTrigger } from '/imports/react-ui/common';


const propTypes = {
  brandId: PropTypes.string.isRequired,
  responseTemplates: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  attachments: PropTypes.array,
};

class ResponseTemplate extends Component {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const doc = {
      brandId: this.props.brandId,
      name: document.getElementById('template-name').value,
      content: document.getElementById('content').value,
      files: this.props.attachments,
    };

    add.call({ doc }, (error) => {
      if (error) return Alert.error(error.message);

      Alert.success('Congrats');

      return document.querySelector('button.close').click();
    });
  }

  onSelect(eventKey) {
    if (eventKey === 'save') {
      return document.getElementById('response-template-handler').click();
    }

    const responseTemplates = this.props.responseTemplates;

    // find response template using event key
    const responseTemplate = _.find(responseTemplates, t => t._id === eventKey);

    return this.props.onSelect(responseTemplate);
  }

  render() {
    const { responseTemplates } = this.props;

    const saveTrigger = (
      <span id="response-template-handler" />
    );

    return (
      <div className="response-template">
        <DropdownButton
          bsStyle="link"
          title="Response template"
          dropup
          id="response-template"
          onSelect={this.onSelect}
        >

          <MenuItem eventKey="save">Save</MenuItem>
          <MenuItem divider />

          {responseTemplates.map(template => (
            <MenuItem key={template._id} eventKey={template._id}>
              {template.name}
            </MenuItem>
          ))}
        </DropdownButton>

        <ModalTrigger title="Create response template" trigger={saveTrigger}>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl id="template-name" type="text" required />
          </FormGroup>

          <Modal.Footer>
            <ButtonToolbar className="pull-right">
              <Button
                onClick={this.onSave}
                type="button"
                bsStyle="primary"
              >
                Save
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </ModalTrigger>
      </div>
    );
  }
}

ResponseTemplate.propTypes = propTypes;

export default ResponseTemplate;
