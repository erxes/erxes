import { withProps } from 'erxes-ui';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import CustomerLoyalties from '../components/CustomerLoyalties';
import queries from '../graphql/queries';
import { CustomerDetailQueryResponse, CustomerLoyaltiesQueryResponse, CustomerLoyaltyQueryResponse } from '../types';

type IProps = {
  customerId?: string;
};

type FinalProps = {
  customerLoyaltiesQuery: CustomerLoyaltiesQueryResponse;
  customerLoyaltyQuery: CustomerLoyaltyQueryResponse;
  customerDetailQuery: CustomerDetailQueryResponse;
} & IProps;

class customerLoyaltiesContainer extends React.Component<FinalProps> {
  render() {
    const { customerLoyaltiesQuery, customerLoyaltyQuery, customerDetailQuery, customerId } = this.props;

    if (customerDetailQuery.loading) {
      return null;
    }

    if (customerLoyaltyQuery.loading) {
      return null;
    }

    if (customerLoyaltiesQuery.loading) {
      return null;
    }

    const customer = customerDetailQuery.customerDetail;
    const loyalties = customerLoyaltiesQuery.customerLoyalties || [];
    const loyalty = customerLoyaltyQuery.customerLoyalty || { loyalty: 0, customerId };

    const extendedProps = {
      ...this.props,
      customer,
      loyalties,
      loyalty
    };
    return <CustomerLoyalties {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<IProps, CustomerLoyaltiesQueryResponse, { customerId: string }>(
      gql(queries.customerLoyalties),
      {
        name: 'customerLoyaltiesQuery',
        options: ({ customerId = '' }) => ({
          variables: { customerId }
        })
      }
    ),
    graphql<IProps, CustomerLoyaltyQueryResponse, { customerId: string }>(
      gql(queries.customerLoyalty),
      {
        name: 'customerLoyaltyQuery',
        options: ({ customerId = '' }) => ({
          variables: { customerId }
        })
      }
    ),
    graphql<IProps, CustomerDetailQueryResponse, { customerId: string }>(
      gql(queries.customerDetail),
      {
        name: 'customerDetailQuery',
        options: ({ customerId }: { customerId: string }) => ({
          variables: {
            _id: customerId
          }
        })
      }
    )
  )(customerLoyaltiesContainer)
)
