import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import FunnelGroup from '../components/funnelImpact/FunnelGroup';
import { queries } from '../graphql';
import { getFilterParams } from '../utils';

type Props = {
  queryParams: any;
  isOpen: boolean;
  hackStage: string;
  onChangeOpen(hackStage: string, isOpen: boolean): void;
};

type FinalProps = {
  growthHacksQuery?: any;
  growthHacksTotalCountQuery: any;
} & Props;

class FunnelGroupContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, growthHacksTotalCountQuery } = this.props;

    let growthHacks = [];
    let loading = false;
    let refetch;

    if (growthHacksQuery) {
      growthHacks = growthHacksQuery.growthHacks || [];
      loading = growthHacksQuery.loading || false;
      refetch = growthHacksQuery.retetch;
    }

    const props = {
      ...this.props,
      growthHacks,
      loading,
      refetch,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount
    };

    return <FunnelGroup {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      skip: ({ isOpen }) => !isOpen,
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage,
          limit: parseInt(queryParams.limit, 10) || 15,
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    }),
    graphql<Props>(gql(queries.growthHacksTotalCount), {
      name: 'growthHacksTotalCountQuery',
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage
        }
      })
    })
  )(FunnelGroupContainer)
);
