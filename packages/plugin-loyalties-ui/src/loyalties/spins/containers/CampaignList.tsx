import { Spinner } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/CampaignList';
import { queries } from '../../../configs/spinCampaign/graphql';
import {
  SpinCampaignsCountQueryResponse,
  SpinCampaignQueryResponse
} from '../../../configs/spinCampaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  spinCampaignQuery: SpinCampaignQueryResponse;
  spinCampaignsCountQuery: SpinCampaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const { spinCampaignQuery, spinCampaignsCountQuery } = this.props;

    if (spinCampaignQuery.loading || spinCampaignsCountQuery.loading) {
      return <Spinner />;
    }
    const spinCampaigns = spinCampaignQuery.spinCampaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: spinCampaignQuery.refetch,
      spinCampaigns,
      loading: spinCampaignQuery.loading,
      spinCampaignsCount: spinCampaignsCountQuery.spinCampaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SpinCampaignQueryResponse, { parentId: string }>(
      gql(queries.spinCampaigns),
      {
        name: 'spinCampaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, SpinCampaignsCountQueryResponse>(
      gql(queries.spinCampaignsCount),
      {
        name: 'spinCampaignsCountQuery'
      }
    )
  )(CarListContainer)
);
