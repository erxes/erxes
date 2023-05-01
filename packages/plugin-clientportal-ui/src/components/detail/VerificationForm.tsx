import { ControlLabel, Form, FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IClientPortalUser, IVerificationRequest } from '../../types';
import React, { useState } from 'react';

import AttachmentsGallery from '@erxes/ui/src/components/AttachmentGallery';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  clientPortalUser: IClientPortalUser;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const VerificationForm = (props: Props) => {
  const { clientPortalUser, closeModal, renderButton } = props;
  const { status, attachments } =
    clientPortalUser.verificationRequest || ({} as IVerificationRequest);

  const [vStatus, setStatus] = useState(status ? status : 'notVerified');

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
            status: vStatus
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

    const renderAttachment = () => {
      if (!attachments || attachments.length === 0) {
        return <EmptyState icon="ban" text="No attachments" size="small" />;
      }

      return (
        <AttachmentsGallery
          attachments={attachments}
          onChange={() => null}
          removeAttachment={() => null}
        />
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Verification status</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={onChange}
            defaultValue={vStatus}
          >
            <option value="notVerified">not verified</option>
            <option value="pending">pending</option>
            <option value="verified">verified</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Verification attachment</ControlLabel>
          {renderAttachment()}
        </FormGroup>

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default VerificationForm;
