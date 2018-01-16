import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { IntegrationList } from '../components';

const IntegrationListContainer = props => {
  const { integrationsQuery, channelDetailQuery, totalCountQuery } = props;

  const totalCount = totalCountQuery.integrationsTotalCount || 0;
  const channelDetail = channelDetailQuery.channelDetail || {};
  const integrations = integrationsQuery.integrations || [];

  const updatedProps = {
    ...props,
    channelDetail,
    integrations,
    totalCount,
    refetch: integrationsQuery.refetch,
    loading: integrationsQuery.loading
  };

  return <IntegrationList {...updatedProps} />;
};

IntegrationListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  integrationsQuery: PropTypes.object,
  channelDetailQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams }) => ({
      variables: {
        channelId: queryParams.id || '',
        perPage: 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.channelDetail), {
    name: 'channelDetailQuery',
    options: ({ queryParams }) => ({
      variables: { _id: queryParams.id || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'totalCountQuery'
  })
)(IntegrationListContainer);
