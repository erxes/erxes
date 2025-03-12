import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import React, { useState } from 'react';

import { IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

interface IProps {
  closeModal?: () => void;
  data: any;
  callData?: { customerPhone: string };
  setConfig?: any;
}

const renderInput = (
  name: string,
  label: string,
  defaultValue: string,
  formProps: any,
) => {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <FormControl
        name={name}
        value={defaultValue}
        disabled={true}
        {...formProps}
      />
    </FormGroup>
  );
};

const CallIntegrationForm = (props: IProps) => {
  const { closeModal, data = {}, setConfig } = props;
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const integration = selectedIntegrationId
    ? data?.find((d) => d._id === selectedIntegrationId)
    : data?.[0];

  const skipCallConnection = () => {
    // tslint:disable-next-line:no-unused-expression

    closeModal && closeModal();
  };

  const onChange = (e) => {
    setSelectedIntegrationId(e.target.value);
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="phone"
            componentclass="select"
            placeholder={__('Select phone')}
            defaultValue={integration?.phone}
            onChange={onChange}
            required={true}
          >
            {data?.map((int) => (
              <option key={int._id} value={int._id}>
                {int.phone}
              </option>
            ))}
          </FormControl>
        </FormGroup>

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
            btnStyle="primary"
            type="button"
            onClick={skipCallConnection}
            icon="times-circle"
          >
            Skip connection
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon="check-circle"
            onClick={() => {}}
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
