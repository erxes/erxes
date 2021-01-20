import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { IBrand } from '../types';

type Props = {
  brand?: IBrand;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
};

class BrandForm extends React.Component<Props> {
  renderFooter(formProps: IFormProps) {
    const { brand, closeModal, renderButton, afterSave } = this.props;
    const { values, isSubmitted } = formProps;

    if (brand) {
      values._id = brand._id;
    }

    return (
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          uppercase={false}
          onClick={closeModal}
        >
          Cancel
        </Button>

        {renderButton({
          name: 'brand',
          values,
          isSubmitted,
          callback: closeModal || afterSave,
          object: brand
        })}
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

        {this.renderFooter({ ...formProps })}
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BrandForm;
