import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import * as React from 'react';
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
  save = (e: React.FormEvent) => {
    e.preventDefault();
    // tslint:disable-next-line:no-console
    console.log(e);
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

  renderContent = formProps => {
    const object = this.props.brand || ({} as IBrand);

    return (
      <form onSubmit={this.save}>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="brand-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            {...formProps}
            name="brand-description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="checked-1"
            type="submit"
            onClick={formProps.runValidations}
          >
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BrandForm;
