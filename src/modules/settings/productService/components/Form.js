import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Form as Formsy,
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

    this.setState({ [name]: value });
  }

  save(doc) {
    this.props.save(doc, () => this.context.closeModal(), this.props.product);
  }

  renderContent() {
    const { name, type, description, sku } = this.state;

    const types = TYPES.ALL;

    return (
      <Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            name="name"
            value={name}
            validations="isValue"
            validationError="Please enter a name"
            type="text"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            componentClass="select"
            name="type"
            value={type}
            validations="isValue"
            validationError="Please select a type"
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
            value={description}
            validations={{}}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>

          <FormControl
            name="sku"
            type="text"
            value={sku}
            validations="isValue"
            validationError="Please enter a SKU"
          />
        </FormGroup>
      </Fragment>
    );
  }

  render() {
    return (
      <Formsy onSubmit={e => this.save(e)}>
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
      </Formsy>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
