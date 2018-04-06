import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'modules/common/components';
import { TYPES } from '../constants';

const propTypes = {
  product: PropTypes.object,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.context.closeModal(),
      this.props.product
    );
  }

  generateDoc() {
    return {
      name: document.getElementById('name').value,
      type: document.getElementById('type').value,
      description: document.getElementById('description').value,
      sku: document.getElementById('sku').value
    };
  }

  renderContent() {
    const product = this.props.product || {};

    const types = TYPES.ALL;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="name"
            defaultValue={product.name}
            type="text"
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            componentClass="select"
            id="type"
            defaultValue={product.type}
            required
          >
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="description"
            componentClass="textarea"
            rows={5}
            defaultValue={product.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>

          <FormControl id="sku" type="text" defaultValue={product.sku} />
        </FormGroup>
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.product || {})}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => this.context.closeModal()}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
