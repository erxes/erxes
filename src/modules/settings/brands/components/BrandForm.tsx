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
  closeModal?: () => void;
  renderButton?: (props: any) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
};

class BrandForm extends React.Component<Props> {
  renderFooter(formProps: IFormProps) {
    const { brand, modal, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    if (brand) {
      values._id = brand._id;
    }

    const saveButton =
      renderButton &&
      renderButton({
        name: 'brand',
        values,
        isSubmitted,
        callback: closeModal,
        object: brand
      });

    // if (!modal) {
    //   return saveButton;
    // }

    return (
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="cancel-1"
          onClick={closeModal}
        >
          Cancel
        </Button>
        {saveButton}
      </ModalFooter>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const object = this.props.brand || ({} as IBrand);

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

        {this.renderFooter({ ...formProps })}
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BrandForm;
