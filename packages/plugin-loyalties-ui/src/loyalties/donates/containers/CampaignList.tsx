import { withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/CampaignList';
import { queries } from '../../../configs/donateCampaign/graphql';
import {
  DonateCampaignsCountQueryResponse,
  DonateCampaignQueryResponse
} from '../../../configs/donateCampaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  donateCampaignQuery: DonateCampaignQueryResponse;
  donateCampaignsCountQuery: DonateCampaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const { donateCampaignQuery, donateCampaignsCountQuery } = this.props;

    if (donateCampaignQuery.loading || donateCampaignsCountQuery.loading) {
      return <Spinner />;
    }
    const donateCampaigns = donateCampaignQuery.donateCampaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: donateCampaignQuery.refetch,
      donateCampaigns,
      loading: donateCampaignQuery.loading,
      donateCampaignsCount: donateCampaignsCountQuery.donateCampaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DonateCampaignQueryResponse, { parentId: string }>(
      gql(queries.donateCampaigns),
      {
        name: 'donateCampaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, DonateCampaignsCountQueryResponse>(
      gql(queries.donateCampaignsCount),
      {
        name: 'donateCampaignsCountQuery'
      }
    )
  )(CarListContainer)
);
