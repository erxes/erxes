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

    this.onChangeInput = this.onChangeInput.bind(this);

    const product = props.product;

    this.state = { type: !product ? TYPES.PRODUCT : '', ...product };
  }

  onChangeInput(e) {
    const { name, value } = e.target;

    this.setState({
      [name]: value
    });
  }

  save(e) {
    e.preventDefault();

    const doc = this.state;

    this.props.save(doc, () => this.context.closeModal(), this.props.product);
  }

  renderContent() {
    const { name, type, description, sku } = this.state;

    const types = TYPES.ALL;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="name"
            defaultValue={name}
            type="text"
            onChange={this.onChangeInput}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            componentClass="select"
            name="type"
            defaultValue={type}
            onChange={this.onChangeInput}
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
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={description}
            onChange={this.onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>

          <FormControl
            name="sku"
            type="text"
            defaultValue={sku}
            onChange={this.onChangeInput}
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={e => this.save(e)}>
        {this.renderContent(this.props.product || {})}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => this.context.closeModal()}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
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
