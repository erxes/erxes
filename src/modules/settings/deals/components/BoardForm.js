import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';

const propTypes = {
  board: PropTypes.object,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class BoardForm extends Component {
  constructor(props) {
    super(props);

    this.generateDoc = this.generateDoc.bind(this);

    this.save = this.save.bind(this);
  }

  save(doc) {
    this.props.save(
      this.generateDoc(doc),
      () => this.context.closeModal(),
      this.props.board
    );
  }

  generateDoc(doc) {
    return {
      doc: {
        name: doc.channelName
      }
    };
  }

  renderContent() {
    const { board } = this.props;

    const object = board || {};

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="channelName"
            validations="isValue"
            validationError="Please enter a name"
            value={object.name}
            type="text"
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <Form onSubmit={this.save}>
        {this.renderContent(this.props.board || {})}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={onClick}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    );
  }
}

BoardForm.propTypes = propTypes;
BoardForm.contextTypes = contextTypes;

export default BoardForm;
