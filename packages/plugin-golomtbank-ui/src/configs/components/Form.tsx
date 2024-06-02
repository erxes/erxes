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

import { IGolomtBankConfigsItem } from '../../types/IGolomtBankConfigs';

type Props = {
  config?: IGolomtBankConfigsItem;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ConfigForm = (props: Props) => {
  const { config } = props;

  const [configObject, setConfigObject] = useState<
    IGolomtBankConfigsItem | undefined
  >(config);

  const generateDoc = () => {
    const finalValues: any = {};

    if (config) {
      finalValues._id = config._id;
    }

    if (configObject) {
      finalValues.userName = configObject.userName;
      finalValues.organizationName = configObject.organizationName;
      finalValues.clientId = configObject.clientId;
      finalValues.sessionKey = configObject.sessionKey;
      finalValues.password = configObject.password;
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

  const renderInput = (formProps, title, userName, type, value) => {
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          {...formProps}
          id={userName}
          nauserNameme={userName}
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
          'UserName',
          'UserName',
          'string',
          config && config.name
        )}
        {renderInput(
          formProps,
          'OrganizationName',
          'organizationName',
          'string',
          config && config.organizationName
        )}
        {renderInput(
          formProps,
          'IvKey',
          'ivKey',
          'string',
          config && config.ivKey
        )}
        {renderInput(
          formProps,
          'ClientId',
          'clientId',
          'password',
          config && config.clientId
        )}
        {renderInput(
          formProps,
          'SessionKey',
          'sessionKey',
          'password',
          config && config.sessionKey
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
