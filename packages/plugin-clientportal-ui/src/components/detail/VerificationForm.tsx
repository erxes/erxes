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
  const { verificationRequest } = clientPortalUser;

  const renderFooter = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

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
          values: {},
          isSubmitted,
          callback: closeModal
        })}
      </ModalFooter>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Verification status</ControlLabel>

          <FormControl
            type="select"
            options={['not verified', 'verified']}
            name="status"
            value={verificationRequest.status}
            autoFocus={true}
            //   onChange={this.handleChange}
          />
        </FormGroup>

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default VerificationForm;
