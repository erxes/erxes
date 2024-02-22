import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Routes from '../routes';
import SipProvider from '../containers/SipProvider';

interface IProps {
  closeModal?: () => void;
  data: any;
  callData?: { callerNumber: string };
  setConfig?: any;
}

const CallButton = (props: IProps) => {
  const trigger = (
    <Button id={'AddPackage'} btnStyle="success" icon="plus-circle">
      Call
    </Button>
  );

  const modalContent = (props) => <SipProvider />;

  return (
    <ModalTrigger
      title={__('Add package')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );
};

export default CallButton;
