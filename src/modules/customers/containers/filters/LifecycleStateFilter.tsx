import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { LifecycleStateFilter } from '../../components';
import { queries } from '../../graphql';

type Props = {
  customersCountQuery: any;
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

export default compose(
  graphql(gql(queries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byLifecycleState' }
    }
  })
)(LifecycleStateFilterContainer);
