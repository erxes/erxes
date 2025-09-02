import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";
import * as compose from "lodash.flowright";
import React from "react";
import LoyaltySection from "../components/LoyaltySection";
import { queries as donateQueries } from "../donates/graphql";
import { DonatesQueryResponse } from "../donates/types";
import { queries as lotteryQueries } from "../lotteries/graphql";
import { LotteriesQueryResponse } from "../lotteries/types";
import { queries as scoreLogQueries } from "../scorelogs/graphql";
import { queries as spinQueries } from "../spins/graphql";
import { SpinsQueryResponse } from "../spins/types";
import { queries as voucherQueries } from "../vouchers/graphql";
import { OwnerVouchersQueryResponse } from "../vouchers/types";

type IProps = {
  ownerType?: string;
  ownerId?: string;
};

type FinalProps = {
  ownerVouchersQuery: OwnerVouchersQueryResponse;
  spinsQuery: SpinsQueryResponse;
  donatesQuery: DonatesQueryResponse;
  lotteriesQuery: LotteriesQueryResponse;
  scoreLogsQuery: any;
} & IProps;

class LoyaltySectionContainer extends React.Component<FinalProps> {
  render() {
    const {
      ownerId,
      ownerType,
      ownerVouchersQuery,
      lotteriesQuery,
      spinsQuery,
      donatesQuery,
      scoreLogsQuery,
    } = this.props;

    if (
      ownerVouchersQuery.loading ||
      lotteriesQuery.loading ||
      spinsQuery.loading ||
      donatesQuery.loading ||
      scoreLogsQuery.loading
    ) {
      return null;
    }

    const ownerVouchers = ownerVouchersQuery.ownerVouchers || [];
    const spins = spinsQuery.spins || [];
    const donates = donatesQuery.donates || [];
    const lotteries = lotteriesQuery.lotteries || [];
    const scoreLogs = scoreLogsQuery?.scoreLogList?.list?.[0]?.scoreLogs || [];

    const extendedProps = {
      ...this.props,
      ownerId,
      ownerType,
      ownerVouchers,
      lotteries,
      spins,
      donates,
      scoreLogs,
      // onclick
    };
    return <LoyaltySection {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<
      IProps,
      OwnerVouchersQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(voucherQueries.ownerVouchers), {
      name: "ownerVouchersQuery",
      options: ({ ownerId }) => ({
        variables: { ownerId },
      }),
    }),
    graphql<IProps, SpinsQueryResponse, { ownerType: string; ownerId: string }>(
      gql(spinQueries.spins),
      {
        name: "spinsQuery",
        options: ({ ownerType, ownerId }) => ({
          variables: { ownerType, ownerId },
        }),
      }
    ),
    graphql<
      IProps,
      LotteriesQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(lotteryQueries.lotteries), {
      name: "lotteriesQuery",
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId },
      }),
    }),
    graphql<
      IProps,
      DonatesQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(donateQueries.donates), {
      name: "donatesQuery",
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId },
      }),
    }),
    graphql<
      IProps,
      DonatesQueryResponse,
      { ownerType: string; ownerId: string }
    >(gql(scoreLogQueries.getScoreLogs), {
      name: "scoreLogsQuery",
      options: ({ ownerType, ownerId }) => ({
        variables: { ownerType, ownerId },
      }),
    })
  )(LoyaltySectionContainer)
);
