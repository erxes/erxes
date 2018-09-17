import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { TYPES } from '../constants';
import { IProduct } from '../types';

type Props = {
  product?: IProduct,
  save: (doc: any, callback: () => void, product: IProduct) => void,
  closeModal?: () => void,
};

type State = {
  _id: string,
  type?: any,
  name: string,
  description: string,
  sku: string,
  createdAt: Date;
}

class Form extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onChangeInput = this.onChangeInput.bind(this);

    const product = props.product;

    this.state = { type: !product ? TYPES.PRODUCT : '', ...product };
  }

  onChangeInput(e) {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  }

  save(e) {
    e.preventDefault();

    const doc = this.state;

    this.props.save(doc, this.props.closeModal, this.props.product);
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
      </Fragment>
    );
  }

  render() {
    return (
      <form onSubmit={e => this.save(e)}>
        {this.renderContent()}

        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
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

export default Form;
