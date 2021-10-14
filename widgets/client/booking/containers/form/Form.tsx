import gql from 'graphql-tag';
import * as React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import DumbForm from '../../components/form/Form';
import { formDetailQuery } from '../../graphql';
import { IBooking, ICurrentStatus } from '../../types';
import { AppConsumer } from '../AppContext';

const Form = (props: ChildProps<IProps, QueryResponse>) => {
  const data = props.data;

  if (!data || data.loading) {
    return null;
  }

  if (!data.formDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    form: data.formDetail,
    booking: props.integration.bookingData
  };

  return <DumbForm {...extendedProps} hasTopBar={true} />;
};

type QueryResponse = {
  formDetail: any;
};

interface IProps {
  integration: any;
  currentStatus: ICurrentStatus;
  onSubmit: (doc: any) => void;
  onCreateNew: () => void;
  setHeight: () => void;
  sendEmail: (params: any) => void;
  callSubmit: boolean;
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
      // callSubmit,
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
          setHeight={() => console.log('set height')}
          integration={integration}
          callSubmit={false}
        />
      );
    }}
  </AppConsumer>
);

export default WithContext;
