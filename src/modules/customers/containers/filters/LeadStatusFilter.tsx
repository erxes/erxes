import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { LeadStatusFilter } from '../../components';
import { queries } from '../../graphql';

type Props = {
  customersCountQuery: any;
};

class LeadStatusFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

    const updatedProps = {
      counts: counts.byLeadStatus || {},
      loading: customersCountQuery.loading
    };

    return <LeadStatusFilter {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byLeadStatus' }
    }
  })
)(LeadStatusFilterContainer);
