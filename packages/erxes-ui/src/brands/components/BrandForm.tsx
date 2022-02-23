import Button from '../../components/Button';
import FormControl from '../../components/form/Control';
import Form from '../../components/form/Form';
import FormGroup from '../../components/form/Group';
import ControlLabel from '../../components/form/Label';
import { ModalFooter } from '../../styles/main';
import { IButtonMutateProps, IFormProps } from '../../types';
import EmailConfigForm from '@erxes/ui-settings/src/general/components/EmailConfigForm';
import React, { useState } from 'react';
import { IBrand } from '../types';

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

  const [emailConfig, setEmailConfig] = useState(object.emailConfig || {});

  const renderFooter = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    if (brand) {
      values._id = brand._id;
    }

    const updatedValues = {
      ...values,
      emailConfig
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

  const renderExtraContent = (isSaved?: boolean) => {
    const { extended } = props;

    if (!extended) {
      return null;
    }

    return (
      <EmailConfigForm
        emailText="Set an email address you wish to send your transactional emails to your customers. For example, chat reply notification to offline customers."
        emailConfig={emailConfig}
        setEmailConfig={setEmailConfig}
        templateName="conversationCron"
        isSaved={isSaved}
      />
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

        {renderExtraContent(formProps.isSaved)}

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BrandForm;
