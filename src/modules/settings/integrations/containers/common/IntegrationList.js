import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { IntegrationList } from '../../components/common';
import { queries } from '../../graphql';
import { integrationsListParams } from '../utils';

const IntegrationListContainer = props => {
  const { integrationsQuery } = props;

  const integrations = integrationsQuery.integrations || [];

  const updatedProps = {
    ...props,
    integrations,
    loading: integrationsQuery.loading
  };

  return <IntegrationList {...updatedProps} />;
};

IntegrationListContainer.propTypes = {
  integrationsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams, variables }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          ...variables,
          ...integrationsListParams(queryParams)
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(IntegrationListContainer);
