import * as React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../common/components';
import { ModalFooter } from '../../../common/styles/main';
import { IBrand } from '../types';

type Props = {
  brand?: IBrand;
  save: (
    params: {
      doc: {
        name: string;
        description: string;
      };
    },
    callback: () => void,
    brand?: IBrand
  ) => void;
  closeModal: () => void;
};

class BrandForm extends React.Component<Props, {}> {
  save = e => {
    e.preventDefault();

    const { save, brand, closeModal } = this.props;
    save(this.generateDoc(), () => closeModal(), brand);
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('brand-name') as HTMLInputElement).value,
        description: (document.getElementById(
          'brand-description'
        ) as HTMLInputElement).value
      }
    };
  };

  renderContent() {
    const object = this.props.brand || ({} as IBrand);

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="brand-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="brand-description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>

          <Button btnStyle="success" icon="checked-1" type="submit">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default BrandForm;
