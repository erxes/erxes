import { withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../components/CompaignList';
import { queries } from '../../../configs/donateCompaign/graphql';
import {
  DonateCompaignsCountQueryResponse,
  DonateCompaignQueryResponse
} from '../../../configs/donateCompaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  donateCompaignQuery: DonateCompaignQueryResponse;
  donateCompaignsCountQuery: DonateCompaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      donateCompaignQuery,
      donateCompaignsCountQuery,
    } = this.props;

    if (donateCompaignQuery.loading || donateCompaignsCountQuery.loading) {
      return <Spinner />
    }
    const donateCompaigns = donateCompaignQuery.donateCompaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: donateCompaignQuery.refetch,
      donateCompaigns,
      loading: donateCompaignQuery.loading,
      donateCompaignsCount:
        donateCompaignsCountQuery.donateCompaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DonateCompaignQueryResponse, { parentId: string }>(
      gql(queries.donateCompaigns),
      {
        name: 'donateCompaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, DonateCompaignsCountQueryResponse>(
      gql(queries.donateCompaignsCount),
      {
        name: 'donateCompaignsCountQuery'
      }
    ),
  )(CarListContainer)
);
