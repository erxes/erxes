import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { TYPES } from '../constants';
import { IProduct, IProductDoc } from '../types';

type Props = {
  product?: IProduct;
  save: (doc: IProductDoc, callback: () => void, product?: IProduct) => void;
  closeModal: () => void;
};

type State = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const product = props.product;

    this.state = { type: !product ? TYPES.PRODUCT : '', ...product };
  }

  onChangeInput = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const doc = this.state;

    this.props.save(doc, this.props.closeModal, this.props.product);
  };

  renderContent() {
    const { name, type, description, sku } = this.state;

    const types = TYPES.ALL;

    const nameOnChange = e =>
      this.onChangeInput('name', (e.target as HTMLInputElement).value);
    const typeOnChange = e =>
      this.onChangeInput('type', (e.target as HTMLInputElement).value);
    const descOnChange = e =>
      this.onChangeInput('description', (e.target as HTMLInputElement).value);
    const skuOnChange = e =>
      this.onChangeInput('sku', (e.target as HTMLInputElement).value);

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            defaultValue={name}
            type="text"
            onChange={nameOnChange}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={type}
            onChange={typeOnChange}
          >
            {types.map((typeName, index) => (
              <option key={index} value={typeName}>
                {typeName}
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
            onChange={descOnChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>

          <FormControl
            name="sku"
            type="text"
            defaultValue={sku}
            onChange={skuOnChange}
          />
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
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
