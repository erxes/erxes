import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IBrand } from '../types';

type Props = {
  brand?: IBrand;
  closeModal: () => void;
  renderButton: (props: any) => JSX.Element;
};

class BrandForm extends React.Component<Props> {
  renderContent = (formProps: IFormProps) => {
    const { brand, closeModal, renderButton } = this.props;
    const object = brand || ({} as IBrand);

    const { values, isSubmitted } = formProps;

    if (brand) {
      values._id = brand._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
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
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            values,
            isSubmitted,
            callback: closeModal,
            object: brand
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BrandForm;
