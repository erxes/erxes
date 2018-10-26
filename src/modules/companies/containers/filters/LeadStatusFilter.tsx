import gql from 'graphql-tag';
import { LeadStatusFilter } from 'modules/customers/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  companyCountsQuery: CountQueryResponse;
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

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(queries.companyCounts),
      {
        name: 'companyCountsQuery',
        options: {
          variables: { only: 'byLeadStatus' }
        }
      }
    )
  )(LeadStatusFilterContainer)
);
