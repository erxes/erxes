import { withProps } from 'erxes-ui';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import LoyaltySection from '../components/LoyaltySection';
import { queries } from '../vouchers/graphql';
import { VouchersQueryResponse } from '../vouchers/types';

type IProps = {
  ownerType?: string;
  ownerId?: string;
};

type FinalProps = {
  vouchersQuery: VouchersQueryResponse;
} & IProps;

class LoyaltySectionContainer extends React.Component<FinalProps> {
  render() {
    const { ownerId, ownerType, vouchersQuery } = this.props;

    if (vouchersQuery.loading) {
      return null;
    }

    const vouchers = vouchersQuery.vouchers || [];

    const extendedProps = {
      ...this.props,
      ownerId,
      ownerType,
      vouchers,
      // onclick
    };
    return <LoyaltySection {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<IProps, VouchersQueryResponse, { ownerType: string, ownerId: string }>(
      gql(queries.vouchers),
      {
        name: 'vouchersQuery',
        options: ({ ownerType, ownerId }) => ({
          variables: { ownerType, ownerId }
        })
      }
    )
  )(LoyaltySectionContainer)
)
