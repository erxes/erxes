import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import IntegrationFilter from '../../components/list/IntegrationFilter';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  customersCountQuery?: CountQueryResponse;
};

class IntegrationFilterContainer extends React.Component<Props> {
  render() {
    const { customersCountQuery } = this.props;

    const counts = (customersCountQuery
      ? customersCountQuery.customerCounts
      : null) || { byIntegrationType: {} };

    const updatedProps = {
      ...this.props,
      loading:
        (customersCountQuery ? customersCountQuery.loading : null) || false,
      counts: counts.byIntegrationType
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
    )
  )(IntegrationFilterContainer)
);
