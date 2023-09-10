import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { queries as inboxQueries } from '@erxes/ui-inbox/src/inbox/graphql';
import IntegrationFilter from '../../components/list/IntegrationFilter';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { IntegrationGetUsedQueryResponse } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  customersCountQuery?: CountQueryResponse;
  integrationsGetUsedTypesQuery?: IntegrationGetUsedQueryResponse;
};

class IntegrationFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery, integrationsGetUsedTypesQuery } = this.props;

    const counts = (customersCountQuery
      ? customersCountQuery.customerCounts
      : null) || { byIntegrationType: {} };

    const loading =
      (customersCountQuery && customersCountQuery.loading) ||
      (integrationsGetUsedTypesQuery &&
        integrationsGetUsedTypesQuery.loading) ||
      false;

    const updatedProps = {
      ...this.props,
      loading,
      counts: counts.byIntegrationType,
      integrationsGetUsedTypes: integrationsGetUsedTypesQuery
        ? integrationsGetUsedTypesQuery.integrationsGetUsedTypes || []
        : []
    };

    return <IntegrationFilter {...updatedProps} />;
  }
}

type WrapperProps = {
  abortController?: any;
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type, abortController }) => ({
          variables: { type, only: 'byIntegrationType' },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<WrapperProps, IntegrationGetUsedQueryResponse>(
      gql(inboxQueries.integrationsGetUsedTypes),
      {
        name: 'integrationsGetUsedTypesQuery',
        options: ({ abortController }) => ({
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(IntegrationFilterContainer)
);
