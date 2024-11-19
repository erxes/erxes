import * as React from 'react';
import { useQuery, gql } from '@apollo/client';
import DumbForm from '../components/Form';
import { connection } from '../connection';
import { formDetailQuery } from '../graphql';
import { IEmailParams, IIntegration } from '../../types';
import { ICurrentStatus, IForm, IFormDoc } from '../types';

interface IProps {
  integration: IIntegration;
  form: IForm;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: IFormDoc) => void;
  onCreateNew: () => void;
  setHeight: () => void;
  sendEmail: (params: IEmailParams) => void;
  callSubmit: boolean;
  extraContent?: string;
  isSubmitting?: boolean;
  invoiceLink?: string;
  createNew: () => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
}

const Form: React.FC<IProps> = ({
  getForm,
  isSubmitting,
  currentStatus,
  createNew,
  sendEmail,
  setHeight,
  extraContent,
  callSubmit,
  invoiceLink,
  getIntegration,
  onSubmit,
}) => {
  const integration = getIntegration();
  const {leadData} = connection.data.form;
  const form = getForm();

  const { data, loading, error } = useQuery(
    gql(formDetailQuery(connection.enabledServices.products)),
    {
      fetchPolicy: 'network-only',
      variables: {
        _id: form._id,
      },
    }
  );

  if (loading) {
    return null;
  }

  if (!data || !data.formDetail) {
    return null;
  }

  if (error) {
    return <div>Error fetching form details.</div>;
  }

  return (
    <DumbForm
      isSubmitting={isSubmitting}
      currentStatus={currentStatus}
      onSubmit={onSubmit}
      onCreateNew={createNew}
      sendEmail={sendEmail}
      setHeight={setHeight}
      form={data.formDetail}
      integration={integration}
      leadData={leadData}
      extraContent={extraContent}
      callSubmit={callSubmit}
      invoiceLink={invoiceLink}
      hasTopBar={true}
    />
  );
};

export default Form;
