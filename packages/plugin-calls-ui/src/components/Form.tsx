import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

interface Props {
  closeModal?: () => void;
  data: any;
  callData?: { callerNumber: String };
  setConfig?: any;
}

const renderInput = (
  name: string,
  label: string,
  defaultValue: string,
  formProps: any
) => {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <FormControl name={name} value={defaultValue} disabled {...formProps} />
    </FormGroup>
  );
};

const CallIntegrationForm = (props: Props) => {
  const { closeModal, data = {}, setConfig } = props;
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const integration = selectedIntegrationId
    ? data?.find(d => d._id === selectedIntegrationId)
    : data?.[0];

  const saveCallConfig = () => {
    integration &&
      localStorage.setItem(
        'config:call_integrations',
        JSON.stringify({
          inboxId: integration?.inboxId,
          phone: integration?.phone,
          wsServer: integration?.wsServer,
          token: integration?.token,
          operators: integration?.operators,
          isAvailable: true
        })
      );
    integration &&
      setConfig({
        inboxId: integration.inboxId,
        phone: integration.phone,
        wsServer: integration.wsServer,
        token: integration.token,
        operators: integration.operators,
        isAvailable: true
      });
    closeModal();
  };

  const onChange = e => {
    setSelectedIntegrationId(e.target.value);
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="phone"
            componentClass="select"
            placeholder={__('Select phone')}
            defaultValue={integration?.phone}
            onChange={onChange}
            required={true}
          >
            {data?.map(int => (
              <option key={int._id} value={int._id}>
                {int.phone}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        {renderInput(
          'wsServer',
          'Web socket server',
          integration?.wsServer,
          formProps
        )}

        {integration?.operators.map((operator: any, index: number) => {
          return (
            <>
              <ControlLabel>Operator {index + 1}</ControlLabel>
              {renderInput('userId', 'user id', operator.userId, formProps)}
              {renderInput(
                'gsUsername',
                'grandstream username',
                operator.gsUsername,
                formProps
              )}
              {renderInput(
                'gsPassword',
                'grandstream password',
                operator.gsPassword,
                formProps
              )}
            </>
          );
        })}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon="check-circle"
            onClick={saveCallConfig}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CallIntegrationForm;
