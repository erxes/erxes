import gql from 'graphql-tag';
import * as React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import DumbForm from '../../../form/components/Form';
import { ICurrentStatus, IForm } from '../../../form/types';
import { formDetailQuery } from '../../graphql';
import { AppConsumer } from '../AppContext';

const Form = (props: ChildProps<IProps, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail,
    integration: props.integration
  };

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

type QueryResponse = {
  formDetail: IForm;
};

interface IProps {
  integration: any;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: any) => void;
  onCreateNew: () => void;
  sendEmail: (params: any) => void;
  isSubmitting?: boolean;
}

const FormWithData = graphql<IProps, QueryResponse>(
  gql(formDetailQuery),

  {
    options: ({ integration }) => ({
      fetchPolicy: 'network-only',
      variables: {
        _id: integration.formId
      }
    })
  }
)(Form);

const WithContext = () => (
  <AppConsumer>
    {({
      currentStatus,
      createNew,
      sendEmail,
      isSubmitting,
      getIntegration,
      save
    }) => {
      const integration = getIntegration();

      return (
        <FormWithData
          isSubmitting={isSubmitting}
          currentStatus={currentStatus}
          onSubmit={save}
          onCreateNew={createNew}
          sendEmail={sendEmail}
          integration={integration}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
