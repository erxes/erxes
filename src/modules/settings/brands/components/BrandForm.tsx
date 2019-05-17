import * as React from 'react';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '../../../common/components';
import { ModalFooter } from '../../../common/styles/main';
import { IFormProps } from '../../../common/types';
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
  generateDoc = values => {
    return {
      doc: values
    };
  };

  renderContent = formProps => {
    const object = this.props.brand || ({} as IBrand);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const { save, brand, closeModal } = this.props;
      save(this.generateDoc(formProps.values), () => closeModal(), brand);
    };

    return (
      <form onSubmit={onSubmit}>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            {...formProps}
            name="description"
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
