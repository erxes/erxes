import Button from '@erxes/ui/src/components/Button';
import { ControlLabel, Form, FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import { IClientPortalUser } from '../../types';

type Props = {
  clientPortalUser: IClientPortalUser;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const VerificationForm = (props: Props) => {
  const { clientPortalUser, closeModal, renderButton } = props;

  const [status, setStatus] = useState(
    clientPortalUser.verificationRequest.status || 'notVerified'
  );

  const renderFooter = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

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
          name: 'clientPortalUser',
          values: {
            userId: clientPortalUser._id,
            status
          },
          isSubmitted,
          callback: closeModal
        })}
      </ModalFooter>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const onChange = e => {
      setStatus(e.target.value);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Verification status</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={onChange}
            defaultValue={status}
          >
            <option value="notVerified">not verified</option>
            <option value="pending">pending</option>
            <option value="verified">verified</option>
          </FormControl>
        </FormGroup>

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default VerificationForm;
