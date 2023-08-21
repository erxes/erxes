import { withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import LoyaltySection from '../components/LoyaltySection';
import { queries as voucherQueries } from '../vouchers/graphql';
import { queries as spinQueries } from '../spins/graphql';
import { queries as donateQueries } from '../donates/graphql';
import { queries as lotteryQueries } from '../lotteries/graphql';
import { VouchersQueryResponse } from '../vouchers/types';
import { SpinsQueryResponse } from '../spins/types';
import { DonatesQueryResponse } from '../donates/types';
import { LotteriesQueryResponse } from '../lotteries/types';

type IProps = {
  ownerType?: string;
  ownerId?: string;
};

type FinalProps = {
  vouchersQuery: VouchersQueryResponse;
  spinsQuery: SpinsQueryResponse;
  donatesQuery: DonatesQueryResponse;
  lotteriesQuery: LotteriesQueryResponse;
} & IProps;

class LoyaltySectionContainer extends React.Component<FinalProps> {
  render() {
    const {
      ownerId,
      ownerType,
      vouchersQuery,
      lotteriesQuery,
      spinsQuery,
      donatesQuery
    } = this.props;

    if (
      vouchersQuery.loading ||
      lotteriesQuery.loading ||
      spinsQuery.loading ||
      donatesQuery.loading
    ) {
      return null;
    }

    const vouchers = vouchersQuery.vouchers || [];
    const spins = spinsQuery.spins || [];
    const donates = donatesQuery.donates || [];
    const lotteries = lotteriesQuery.lotteries || [];

    const extendedProps = {
      ...this.props,
      ownerId,
      ownerType,
      vouchers,
      lotteries,
      spins,
      donates
      // onclick
    };
    return <LoyaltySection {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<
      IProps,
      VouchersQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(voucherQueries.vouchers), {
      name: 'vouchersQuery',
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId }
      })
    }),
    graphql<IProps, SpinsQueryResponse, { ownerType: string; ownerId: string }>(
      gql(spinQueries.spins),
      {
        name: 'spinsQuery',
        options: ({ ownerType, ownerId }) => ({
          variables: { ownerType, ownerId }
        })
      }
    ),
    graphql<
      IProps,
      LotteriesQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(lotteryQueries.lotteries), {
      name: 'lotteriesQuery',
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId }
      })
    }),
    graphql<
      IProps,
      DonatesQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(donateQueries.donates), {
      name: 'donatesQuery',
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId }
      })
    })
  )(LoyaltySectionContainer)
);
