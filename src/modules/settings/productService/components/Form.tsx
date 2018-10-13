import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { TYPES } from '../constants';
import { IProduct } from '../types';

type Doc = {
  type: string;
  _id?: string;
  name?: string;
  description?: string;
  sku?: string;
  createdAt?: Date;
};

type Props = {
  product?: IProduct;
  save: (doc: Doc, callback: () => void, product?: IProduct) => void;
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

    this.onChangeInput = this.onChangeInput.bind(this);

    const product = props.product;

    this.state = { type: !product ? TYPES.PRODUCT : '', ...product };
  }

  onChangeInput<T extends keyof State>(name: T, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
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
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            defaultValue={name}
            type="text"
            onChange={e =>
              this.onChangeInput('name', (e.target as HTMLInputElement).value)
            }
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={type}
            onChange={e =>
              this.onChangeInput('type', (e.target as HTMLInputElement).value)
            }
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
            onChange={e =>
              this.onChangeInput(
                'description',
                (e.target as HTMLInputElement).value
              )
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>SKU</ControlLabel>

          <FormControl
            name="sku"
            type="text"
            defaultValue={sku}
            onChange={e =>
              this.onChangeInput('sku', (e.target as HTMLInputElement).value)
            }
          />
        </FormGroup>
      </React.Fragment>
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
