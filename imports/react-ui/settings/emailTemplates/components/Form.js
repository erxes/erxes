import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Modal,
  Button,
} from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { add, edit } from '/imports/api/emailTemplates/methods';

const propTypes = {
  emailTemplate: PropTypes.object,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    const params = {
      doc: {
        name: document.getElementById('template-name').value,
        content: document.getElementById('template-content').value,
      },
    };

    let methodName = add;

    // if edit mode
    if (this.props.emailTemplate._id) {
      methodName = edit;
      params.id = this.props.emailTemplate._id;
    }

    methodName.call(params, error => {
      if (error) return Alert.error(error.message);

      Alert.success('Congrats');
      return this.context.closeModal();
    });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const { emailTemplate } = this.props;

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="template-name" defaultValue={emailTemplate.name} type="text" required />
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

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClick}>Cancel</Button>
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
