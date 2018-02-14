import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class Form extends Component {
  renderContent() {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="brand-name"
            defaultValue="Product Name"
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            id="brand-name"
            defaultValue="Product Type"
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="brand-description"
            componentClass="textarea"
            rows={5}
            defaultValue="Product Description"
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <Modal.Footer>
          <Button btnStyle="link" type="submit">
            SKU
          </Button>

          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close" icon="close">
            Save & Close
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}
Form.contextTypes = contextTypes;

export default Form;
