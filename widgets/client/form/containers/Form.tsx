import * as React from 'react';
import gql from 'graphql-tag';
import DumbForm from '../components/Form';
import { connection } from '../connection';
import { formDetailQuery } from '../graphql';
import { useAppContext } from './AppContext';
import { useQuery } from '@apollo/react-hooks';

const Form = () => {
  const {
    currentStatus,
    save,
    createNew,
    sendEmail,
    setHeight,
    getIntegration,
    callSubmit,
    extraContent,
    isSubmitting,
    getForm,
    onChangeCurrentStatus,
    invoiceLink,
  } = useAppContext();

  const form = getForm();
  const integration = getIntegration();

  const { data, loading } = useQuery(
    gql(formDetailQuery(connection.enabledServices.products), {
      variables: {
        _id: form._id,
      },
      fetchPolicy: 'network-only',
    })
  );

  if (!data || loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    currentStatus,
    onCreateNew: createNew,
    sendEmail,
    setHeight,
    integration,
    callSubmit,
    extraContent,
    isSubmitting,
    onChangeCurrentStatus,
    invoiceLink,
    form: data.formDetail,
    onSubmit: save,
  };

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

export default Form;
