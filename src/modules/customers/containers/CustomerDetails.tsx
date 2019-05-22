import gql from 'graphql-tag';
import { EmptyState, Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerDetails } from '../components';
import { queries } from '../graphql';
import { CustomerDetailQueryResponse } from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
} & Props;

class CustomerDetailsContainer extends React.Component<FinalProps, {}> {
  render() {
    const { id, customerDetailQuery } = this.props;

    if (customerDetailQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (!customerDetailQuery.customerDetail) {
      return (
        <EmptyState text="Customer not found" image="/images/actions/17.svg" />
      );
    }

    const taggerRefetchQueries = [
      {
        query: gql(queries.customerDetail),
        variables: { _id: id }
      }
    ];

    const updatedProps = {
      ...this.props,
      customer: customerDetailQuery.customerDetail || {},
      taggerRefetchQueries
    };

    return <CustomerDetails {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CustomerDetailQueryResponse, { _id: string }>(
      gql(queries.customerDetail),
      {
        name: 'customerDetailQuery',
        options: ({ id }: { id: string }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(CustomerDetailsContainer)
);
