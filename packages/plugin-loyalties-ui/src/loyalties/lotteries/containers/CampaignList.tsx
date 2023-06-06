import { Spinner } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/CampaignList';
import { queries } from '../../../configs/lotteryCampaign/graphql';
import {
  LotteryCampaignsCountQueryResponse,
  LotteryCampaignQueryResponse
} from '../../../configs/lotteryCampaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  lotteryCampaignQuery: LotteryCampaignQueryResponse;
  lotteryCampaignsCountQuery: LotteryCampaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const { lotteryCampaignQuery, lotteryCampaignsCountQuery } = this.props;

    if (lotteryCampaignQuery.loading || lotteryCampaignsCountQuery.loading) {
      return <Spinner />;
    }
    const lotteryCampaigns = lotteryCampaignQuery.lotteryCampaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: lotteryCampaignQuery.refetch,
      lotteryCampaigns,
      loading: lotteryCampaignQuery.loading,
      lotteryCampaignsCount:
        lotteryCampaignsCountQuery.lotteryCampaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, LotteryCampaignQueryResponse, { parentId: string }>(
      gql(queries.lotteryCampaigns),
      {
        name: 'lotteryCampaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, LotteryCampaignsCountQueryResponse>(
      gql(queries.lotteryCampaignsCount),
      {
        name: 'lotteryCampaignsCountQuery'
      }
    )
  )(CarListContainer)
);
