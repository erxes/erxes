import gql from 'graphql-tag';
import { LifecycleStateFilter } from 'modules/customers/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  companyCountsQuery?: CountQueryResponse;
};

class LifecycleStateFilterContainer extends React.Component<Props> {
  render() {
    const { companyCountsQuery } = this.props;

    const counts = (companyCountsQuery
      ? companyCountsQuery.companyCounts
      : null) || { byLifecycleState: {} };

    const updatedProps = {
      counts: counts.byLifecycleState || {},
      loading: (companyCountsQuery ? companyCountsQuery.loading : null) || false
    };

    return <LifecycleStateFilter {...updatedProps} />;
  }
}

export default withProps<{ loadingMainQuery: boolean }>(
  compose(
    graphql<
      { loadingMainQuery: boolean },
      CountQueryResponse,
      { only: string }
    >(gql(queries.companyCounts), {
      name: 'companyCountsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'byLifecycleState' }
      }
    })
  )(LifecycleStateFilterContainer)
);
