import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { LifecycleStateFilter } from '../../components';
import { queries } from '../../graphql';
import { CountQueryResponse } from './BrandFilter';

type Props = {
  customersCountQuery: CountQueryResponse;
};

class LifecycleStateFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

    const updatedProps = {
      counts: counts.byLifecycleState || {},
      loading: customersCountQuery.loading
    };

    return <LifecycleStateFilter {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byLifecycleState' }
        }
      }
    )
  )(LifecycleStateFilterContainer)
);
