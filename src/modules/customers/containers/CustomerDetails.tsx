import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerDetails } from '../components';
import { queries } from '../graphql';

type Props = {
  id: string;
  customerDetailQuery: any;
  customerActivityLogQuery: any;
  currentUser: IUser;
};

const CustomerDetailsContainer = (props: Props, context) => {
  const {
    id,
    customerDetailQuery,
    customerActivityLogQuery,
    currentUser
  } = props;

  if (customerDetailQuery.loading) {
    return <Spinner />;
  }

  const taggerRefetchQueries = [
    {
      query: gql(queries.customerDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    customer: customerDetailQuery.customerDetail,
    loadingLogs: customerActivityLogQuery.loading,
    activityLogsCustomer: customerActivityLogQuery.activityLogsCustomer || [],
    taggerRefetchQueries,
    currentUser
  };

  return <CustomerDetails {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.customerDetail), {
    name: 'customerDetailQuery',
    options: ({ id }: { id: string }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.activityLogsCustomer), {
    name: 'customerActivityLogQuery',
    options: ({ id }: { id: string }) => ({
      variables: {
        _id: id
      }
    })
  })
)(CustomerDetailsContainer);
