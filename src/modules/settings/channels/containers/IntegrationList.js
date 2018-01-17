import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { IntegrationList } from '../components';

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
    options: ({ queryParams, currentChannel }) => ({
      variables: {
        channelId: currentChannel._id,
        page: queryParams.page,
        perPage: queryParams.perPage || 20
      },
      fetchPolicy: 'network-only'
    })
  })
)(IntegrationListContainer);
