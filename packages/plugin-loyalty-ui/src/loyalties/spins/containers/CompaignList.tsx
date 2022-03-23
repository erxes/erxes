import { Spinner } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../components/CompaignList';
import { queries } from '../../../configs/spinCompaign/graphql';
import {
  SpinCompaignsCountQueryResponse,
  SpinCompaignQueryResponse
} from '../../../configs/spinCompaign/types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  spinCompaignQuery: SpinCompaignQueryResponse;
  spinCompaignsCountQuery: SpinCompaignsCountQueryResponse;
} & Props;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      spinCompaignQuery,
      spinCompaignsCountQuery,
    } = this.props;

    if (spinCompaignQuery.loading || spinCompaignsCountQuery.loading) {
      return <Spinner />
    }
    const spinCompaigns = spinCompaignQuery.spinCompaigns || [];

    const updatedProps = {
      ...this.props,
      refetch: spinCompaignQuery.refetch,
      spinCompaigns,
      loading: spinCompaignQuery.loading,
      spinCompaignsCount:
        spinCompaignsCountQuery.spinCompaignsCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SpinCompaignQueryResponse, { parentId: string }>(
      gql(queries.spinCompaigns),
      {
        name: 'spinCompaignQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, SpinCompaignsCountQueryResponse>(
      gql(queries.spinCompaignsCount),
      {
        name: 'spinCompaignsCountQuery'
      }
    ),
  )(CarListContainer)
);
