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
    callback?: () => void,
    brand?: IBrand
  ) => void;
  closeModal?: () => void;
  afterSave?: () => void;
  modal?: boolean;
};

class BrandForm extends React.Component<Props, {}> {
  save = (e: React.FormEvent) => {
    e.preventDefault();

    const { modal = true, save, brand, closeModal, afterSave } = this.props;

    const doc = this.generateDoc();

    if (modal) {
      return save(doc, () => closeModal && closeModal(), brand);
    }

    save(doc);

    if (afterSave) {
      afterSave();
    }
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

  renderFooter() {
    const { modal } = this.props;

    const saveButton = (
      <Button btnStyle="success" icon="checked-1" type="submit">
        Save
      </Button>
    );

    if (!modal) {
      return saveButton;
    }

    return (
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="cancel-1"
          onClick={this.props.closeModal}
        >
          Cancel
        </Button>
        {saveButton}
      </ModalFooter>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        {this.renderFooter()}
      </form>
    );
  }
}

export default BrandForm;
