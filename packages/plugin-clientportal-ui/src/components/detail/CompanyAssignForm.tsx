import { ControlLabel, Form, FormControl } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IClientPortalUser, IVerificationRequest } from '../../types';
import React, { useState } from 'react';

import AttachmentsGallery from '@erxes/ui/src/components/AttachmentGallery';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';

import Select from 'react-select-plus';

type Props = {
  clientPortalUser: IClientPortalUser;
  companies: any;

  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const CompanyAssignForm = (props: Props) => {
  const { clientPortalUser, companies, closeModal, renderButton } = props;

  const renderContent = (formProps: IFormProps) => {
    console.log(companies);
    return (
      <>
        <FormGroup>
          <ControlLabel>Verification status</ControlLabel>
          <FormControl componentClass="select">
            {companies &&
              companies.map(company => (
                <option value={company._id} key={company._id}>
                  {company.name}
                </option>
              ))}
          </FormControl>
        </FormGroup>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CompanyAssignForm;
