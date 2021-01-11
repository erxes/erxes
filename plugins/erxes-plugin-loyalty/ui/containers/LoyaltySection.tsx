import { withProps } from 'erxes-ui';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import LoyaltySection from '../components/LoyaltySection';
import queries from '../graphql/queries';
import { CustomerLoyaltyQueryResponse } from '../types';

type IProps = {
  customerId?: string;
};

type FinalProps = {
  customerLoyaltyQuery: CustomerLoyaltyQueryResponse;
} & IProps;

class LoyaltySectionContainer extends React.Component<FinalProps> {
  render() {
    const { customerId, customerLoyaltyQuery } = this.props;

    if (customerLoyaltyQuery.loading) {
      return null;
    }

    const customerLoyalty = customerLoyaltyQuery.customerLoyalty || { loyalty: 0, customerId };

    const extendedProps = {
      ...this.props,
      customerId,
      customerLoyalty,
      // onclick
    };
    return <LoyaltySection {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<IProps, CustomerLoyaltyQueryResponse, { customerId: string }>(
      gql(queries.customerLoyalty),
      {
        name: 'customerLoyaltyQuery',
        options: ({ customerId = '' }) => ({
          variables: { customerId }
        })
      }
    )
  )(LoyaltySectionContainer)
)
