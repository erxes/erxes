import gql from 'graphql-tag';
import { LeadStatusFilter } from 'modules/customers/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  companyCountsQuery?: CountQueryResponse;
};

class LeadStatusFilterContainer extends React.Component<Props> {
  render() {
    const { companyCountsQuery } = this.props;

    const counts = (companyCountsQuery
      ? companyCountsQuery.companyCounts
      : null) || { byLeadStatus: {} };

    const updatedProps = {
      counts: counts.byLeadStatus || {},
      loading: (companyCountsQuery ? companyCountsQuery.loading : null) || false
    };

    return <LeadStatusFilter {...updatedProps} />;
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
        variables: { only: 'byLeadStatus' }
      }
    })
  )(LeadStatusFilterContainer)
);
