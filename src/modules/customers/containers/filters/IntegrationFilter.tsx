import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IntegrationFilter } from '../../components';
import { queries as customerQueries } from '../../graphql';

type Props = {
  customersCountQuery: any;
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

export default compose(
  graphql(gql(customerQueries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byIntegrationType' }
    }
  })
)(IntegrationFilterContainer);
