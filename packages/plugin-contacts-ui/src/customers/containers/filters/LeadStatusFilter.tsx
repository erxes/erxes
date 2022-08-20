import { queries } from '@erxes/ui-contacts/src/customers/graphql';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import LeadStatusFilter from '../../components/list/LeadStatusFilter';

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

type WrapperProps = {
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type }) => ({
          variables: { type, only: 'byLeadStatus' }
        })
      }
    )
  )(LeadStatusFilterContainer)
);
