import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { IntegrationFilter } from '../../components';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from './BrandFilter';

type Props = {
  customersCountQuery: CountQueryResponse;
  loading: boolean;
};

class IntegrationFilterContainer extends React.Component<Props> {
  render() {
    const { loading, customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

    const updatedProps = {
      ...this.props,
      loading,
      counts: counts.byIntegrationType || {}
    };

    return <IntegrationFilter {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byIntegrationType' }
        }
      }
    )
  )(IntegrationFilterContainer)
);
