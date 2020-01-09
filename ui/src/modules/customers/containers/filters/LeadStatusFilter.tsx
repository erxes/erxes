import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import LeadStatusFilter from '../../components/list/LeadStatusFilter';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  customersCountQuery?: CountQueryResponse;
};

class LeadStatusFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = (customersCountQuery
      ? customersCountQuery.customerCounts
      : null) || { byLeadStatus: {} };

    const updatedProps = {
      counts: counts.byLeadStatus || {},
      loading: customersCountQuery ? customersCountQuery.loading : false
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
    >(gql(queries.customerCounts), {
      name: 'customersCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: {
        variables: { only: 'byLeadStatus' }
      }
    })
  )(LeadStatusFilterContainer)
);
