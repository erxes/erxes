import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import Form from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";

import { IGolomtBankConfigsItem } from "../../types/IConfigs";

type Props = {
  config?: IGolomtBankConfigsItem;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ConfigForm = (props: Props) => {
  const { config } = props;

  const [configObject, setConfigObject] = useState<
    IGolomtBankConfigsItem | undefined
  >(
    config && {
      ...config
    }
  );

  const generateDoc = () => {
    const finalValues: any = {};

    if (config) {
      finalValues._id = config._id;
    }

    if (configObject) {
      finalValues.registerId = configObject.registerId;
      finalValues.ivKey = configObject.ivKey;
      finalValues.name = configObject.name;
      finalValues.organizationName = configObject.organizationName;
      finalValues.clientId = configObject.clientId;
      finalValues.sessionKey = configObject.sessionKey;
      finalValues.configPassword = configObject.configPassword;
      finalValues.accountId = configObject.accountId;
      finalValues.golomtCode = configObject.golomtCode;
      finalValues.apiUrl = configObject.apiUrl;
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
          "RegisterId",
          "registerId",
          "string",
          config && config.registerId
        )}
        {renderInput(
          formProps,
          "AccountId",
          "accountId",
          "string",
          config && config.accountId
        )}
        {renderInput(
          formProps,
          "Name",
          "name",
          "string",
          config && config.name
        )}
        {renderInput(
          formProps,
          "OrganizationName",
          "organizationName",
          "string",
          config && config.organizationName
        )}
        {renderInput(
          formProps,
          "IvKey",
          "ivKey",
          "string",
          config && config.ivKey
        )}
        {renderInput(
          formProps,
          "ClientId",
          "clientId",
          "string",
          config && config.clientId
        )}
        {renderInput(
          formProps,
          "SessionKey",
          "sessionKey",
          "string",
          config && config.sessionKey
        )}
        {renderInput(
          formProps,
          "GolomtCode",
          "golomtCode",
          "string",
          config && config.golomtCode
        )}
        {renderInput(
          formProps,
          "ApiUrl",
          "apiUrl",
          "string",
          config && config.apiUrl
        )}
        {renderInput(
          formProps,
          "ConfigPassword",
          "configPassword",
          "password",
          config && config.configPassword
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: "configs",
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
