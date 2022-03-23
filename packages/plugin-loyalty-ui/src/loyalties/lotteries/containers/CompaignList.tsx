import { Spinner } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../components/CompaignList';
import { queries } from '../../../configs/lotteryCompaign/graphql';
import {
  LotteryCompaignsCountQueryResponse,
  LotteryCompaignQueryResponse
} from '../../../configs/lotteryCompaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  lotteryCompaignQuery: LotteryCompaignQueryResponse;
  lotteryCompaignsCountQuery: LotteryCompaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      lotteryCompaignQuery,
      lotteryCompaignsCountQuery,
    } = this.props;

    if (lotteryCompaignQuery.loading || lotteryCompaignsCountQuery.loading) {
      return <Spinner />
    }
    const lotteryCompaigns = lotteryCompaignQuery.lotteryCompaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: lotteryCompaignQuery.refetch,
      lotteryCompaigns,
      loading: lotteryCompaignQuery.loading,
      lotteryCompaignsCount:
        lotteryCompaignsCountQuery.lotteryCompaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, LotteryCompaignQueryResponse, { parentId: string }>(
      gql(queries.lotteryCompaigns),
      {
        name: 'lotteryCompaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, LotteryCompaignsCountQueryResponse>(
      gql(queries.lotteryCompaignsCount),
      {
        name: 'lotteryCompaignsCountQuery'
      }
    ),
  )(CarListContainer)
);
