import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import IntegrationFilter from '../../components/list/IntegrationFilter';
import { queries as customerQueries } from '../../graphql';
import { queries as inboxQueries } from '../../../inbox/graphql';
import {
  CountQueryResponse,
  IntegrationGetUsedQueryResponse
} from '../../types';

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
        options: ({ type }) => ({
          variables: { type, only: 'byIntegrationType' }
        })
      }
    ),
    graphql<WrapperProps, IntegrationGetUsedQueryResponse>(
      gql(inboxQueries.integrationsGetUsedTypes),
      {
        name: 'integrationsGetUsedTypesQuery'
      }
    )
  )(IntegrationFilterContainer)
);
