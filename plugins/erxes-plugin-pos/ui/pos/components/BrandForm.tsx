import {
  Button,
  FormControl,
  Form,
  FormGroup,
  ControlLabel,
} from 'erxes-ui';
import { IFormProps } from 'erxes-ui/lib/types';
import { IButtonMutateProps } from '../../types';
import React from 'react';
import { IBrand } from 'erxes-ui/lib/products/types';
import { ModalFooter} from 'erxes-ui/lib/styles/main'

type Props = {
  brand?: IBrand;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
  extended?: boolean;
};

const BrandForm = (props: Props) => {
  const { brand, closeModal, renderButton, afterSave } = props;
  const object = brand || ({} as IBrand);


  const renderFooter = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    if (brand) {
      values._id = brand._id;
    }

    const updatedValues = {
      ...values,
    };

    return (
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          onClick={closeModal}
        >
          Cancel
        </Button>

        {renderButton({
          name: 'brand',
          values: updatedValues,
          isSubmitted,
          callback: closeModal || afterSave,
          object: brand
        })}
      </ModalFooter>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
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

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BrandForm;
