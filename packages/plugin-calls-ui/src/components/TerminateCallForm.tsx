import { Button, ControlLabel, Form } from '@erxes/ui/src/components';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
interface IProps {
  closeModal?: () => void;
  setConfig?: any;
  removeActiveSession?: () => {};
}

const TerminateSessionForm = (props: IProps) => {
  const { closeModal, setConfig, removeActiveSession } = props;

  const onOk = () => {
    // tslint:disable-next-line:no-unused-expression
    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('config:call_integrations')),
        isAvailable: true
      })
    );

    // tslint:disable-next-line:no-unused-expression

    removeActiveSession();
    closeModal();
  };

  const onCancel = () => {
    localStorage.setItem(
      'callInfo',
      JSON.stringify({
        isUnRegistered: true
      })
    );

    localStorage.setItem(
      'config:call_integrations',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('config:call_integrations')),
        isAvailable: false
      })
    );
    closeModal();
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <ControlLabel>
          Already established the call connection. Disconnect the created
          connection?
        </ControlLabel>

        <ModalFooter>
          <Button type="button" onClick={onCancel} icon="times-circle">
            No
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon="check-circle"
            onClick={onOk}
          >
            {__('Yes')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TerminateSessionForm;
