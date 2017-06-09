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

    // states
    this.state = { contentTemplate: this.props.emailTemplate.content };

    this.save = this.save.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.onTemplateChange = this.onTemplateChange.bind(this);
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

  onTemplateChange(e) {
    this.setState({ contentTemplate: e.target.value });
  }

  renderPreview() {
    if (this.state.contentTemplate) {
      return (
        <FormGroup>
          <ControlLabel>Preview</ControlLabel>

          <div dangerouslySetInnerHTML={{ __html: this.state.contentTemplate }} />
        </FormGroup>
      );
    }
    return null;
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
            onChange={this.onTemplateChange}
            defaultValue={emailTemplate.content}
          />
        </FormGroup>

        {this.renderPreview()}

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
