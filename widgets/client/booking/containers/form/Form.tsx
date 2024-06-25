import gql from 'graphql-tag';
import * as React from 'react';
import DumbForm from '../../../form/components/Form';
import { IForm } from '../../../form/types';
import { formDetailQuery } from '../../graphql';
import { useAppContext } from '../AppContext';
import { useQuery } from '@apollo/react-hooks';

type QueryResponse = {
  formDetail: IForm;
};

const Form = () => {
  const {
    currentStatus,
    createNew,
    sendEmail,
    isSubmitting,
    getIntegration,
    save,
    onChangeCurrentStatus,
  } = useAppContext();

  const integration = getIntegration();

  const { data, loading } = useQuery(gql(formDetailQuery), {
    variables: {
      _id: integration.formId,
    },
    fetchPolicy: 'network-only',
  });

  if (!data || loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    isSubmitting,
    currentStatus,
    onSubmit: save,
    onCreateNew: createNew,
    sendEmail,
    integration,
    onChangeCurrentStatus,
    form: data.formDetail,
  };

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

export default Form;
