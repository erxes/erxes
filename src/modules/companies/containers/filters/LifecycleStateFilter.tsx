import gql from 'graphql-tag';
import { LifecycleStateFilter } from 'modules/customers/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  companyCountsQuery: CountQueryResponse;
};

class LifecycleStateFilterContainer extends React.Component<Props> {
  render() {
    const { companyCountsQuery } = this.props;

    const counts = companyCountsQuery.companyCounts || {};

    const updatedProps = {
      counts: counts.byLifecycleState || {},
      loading: companyCountsQuery.loading
    };

    return <LifecycleStateFilter {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(queries.companyCounts),
      {
        name: 'companyCountsQuery',
        options: {
          variables: { only: 'byLifecycleState' }
        }
      }
    )
  )(LifecycleStateFilterContainer)
);
