import LocationOption from '@erxes/ui-forms/src/settings/properties/components/LocationOption';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';

import { IKhanbankConfigsItem } from '../types';

type Props = {
  config?: IKhanbankConfigsItem;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ConfigForm = (props: Props) => {
  const { config } = props;

  const [configObject, setConfigObject] = useState<
    IKhanbankConfigsItem | undefined
  >(config);

  const generateDoc = () => {
    const finalValues: any = {};

    if (config) {
      finalValues._id = config._id;
    }

    if (configObject) {
      finalValues.name = configObject.name;
      finalValues.description = configObject.description;
      finalValues.consumerKey = configObject.consumerKey;
      finalValues.secretKey = configObject.secretKey;
    }

    return {
      ...finalValues
    };
  };

  const onChangeInput = e => {
    const { id, value } = e.target;

    const obj: any = configObject || {};

    obj[id] = value;

    setConfigObject(obj);
  };

  const renderInput = (formProps, title, name, type, value) => {
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          {...formProps}
          id={name}
          name={name}
          type={type}
          defaultValue={value}
          onChange={onChangeInput}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        {renderInput(
          formProps,
          'Name',
          'name',
          'string',
          config && config.name
        )}
        {renderInput(
          formProps,
          'Description',
          'description',
          'string',
          config && config.description
        )}
        {renderInput(
          formProps,
          'Consumer Key',
          'consumerKey',
          'string',
          config && config.consumerKey
        )}
        {renderInput(
          formProps,
          'Secret Key',
          'secretKey',
          'password',
          config && config.secretKey
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'configs',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: config
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ConfigForm;
