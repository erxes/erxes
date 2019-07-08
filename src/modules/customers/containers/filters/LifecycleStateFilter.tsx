import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import LifecycleStateFilter from '../../components/list/LifecycleStateFilter';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  customersCountQuery?: CountQueryResponse;
};

class LifecycleStateFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = (customersCountQuery
      ? customersCountQuery.customerCounts
      : null) || { byLifecycleState: {} };

    const updatedProps = {
      counts: counts.byLifecycleState || {},
      loading: customersCountQuery ? customersCountQuery.loading : false
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
    >(gql(queries.customerCounts), {
      name: 'customersCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'byLifecycleState' }
      }
    })
  )(LifecycleStateFilterContainer)
);
