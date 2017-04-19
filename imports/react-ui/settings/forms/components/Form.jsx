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
import { add, edit } from '/imports/api/forms/methods';

const propTypes = {
  form: PropTypes.object,
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
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
      },
    };

    let method = add;

    // if edit mode
    if (this.props.form) {
      method = edit;
      params.id = this.props.form._id;
    }

    method.call(params, error => {
      if (error) return Alert.error(error.reason);

      Alert.success('Form is successfully saved.');
      return this.context.closeModal();
    });
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    const form = this.props.form || {};

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl id="title" defaultValue={form.title} required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="description"
            componentClass="textarea"
            rows={5}
            defaultValue={form.description}
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
