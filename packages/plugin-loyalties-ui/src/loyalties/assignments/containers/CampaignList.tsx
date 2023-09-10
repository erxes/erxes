import { withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import List from '../components/CampaignList';
import { queries } from '../../../configs/assignmentCampaign/graphql';
import {
  AssignmentCampaignsCountQueryResponse,
  AssignmentCampaignQueryResponse
} from '../../../configs/assignmentCampaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  assignmentCampaignQuery: AssignmentCampaignQueryResponse;
  assignmentCampaignsCountQuery: AssignmentCampaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      assignmentCampaignQuery,
      assignmentCampaignsCountQuery
    } = this.props;

    if (
      assignmentCampaignQuery.loading ||
      assignmentCampaignsCountQuery.loading
    ) {
      return <Spinner />;
    }
    const assignmentCampaigns =
      assignmentCampaignQuery.assignmentCampaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: assignmentCampaignQuery.refetch,
      assignmentCampaigns,
      loading: assignmentCampaignQuery.loading,
      assignmentCampaignsCount:
        assignmentCampaignsCountQuery.assignmentCampaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, AssignmentCampaignQueryResponse, { parentId: string }>(
      gql(queries.assignmentCampaigns),
      {
        name: 'assignmentCampaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, AssignmentCampaignsCountQueryResponse>(
      gql(queries.assignmentCampaignsCount),
      {
        name: 'assignmentCampaignsCountQuery'
      }
    )
  )(CarListContainer)
);
