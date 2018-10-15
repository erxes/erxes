import gql from 'graphql-tag';
import { LeadStatusFilter } from 'modules/customers/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  companyCountsQuery: any;
};

class LeadStatusFilterContainer extends React.Component<Props> {
  render() {
    const { companyCountsQuery } = this.props;

    const counts = companyCountsQuery.companyCounts || {};

    const updatedProps = {
      counts: counts.byLeadStatus || {},
      loading: companyCountsQuery.loading
    };

    return <LeadStatusFilter {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: {
      variables: { only: 'byLeadStatus' }
    }
  })
)(LeadStatusFilterContainer);
