import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import WeightedScore from 'modules/growthHacks/components/weightedScore/WeightedScore';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { getFilterParams } from '../utils';

type Props = {
  queryParams: any;
};

type FinalProps = {
  growthHacksQuery: any;
  growthHacksTotalCountQuery: any;
} & Props;

class WeigthedScoreContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, growthHacksTotalCountQuery } = this.props;

    const { growthHacks = [], loading, refetch } = growthHacksQuery;

    const props = {
      ...this.props,
      growthHacks,
      loading,
      refetch,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount
    };

    return <WeightedScore {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      options: ({ queryParams = {} }) => ({
        variables: {
          ...getFilterParams(queryParams),
          limit: parseInt(queryParams.limit, 10) || 15,
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    }),
    graphql<Props>(gql(queries.growthHacksTotalCount), {
      name: 'growthHacksTotalCountQuery',
      options: ({ queryParams = {} }) => ({
        variables: getFilterParams(queryParams)
      })
    })
  )(WeigthedScoreContainer)
);
