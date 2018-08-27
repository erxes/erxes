import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import { IntegrationList } from 'modules/settings/integrations/components/common';
import { queries, mutations } from 'modules/settings/integrations/graphql';

const IntegrationListContainer = props => {
  const { integrationsQuery, removeMutation } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective />;
  }

  const integrations = integrationsQuery.integrations || [];

  const removeIntegration = (integration, callback) => {
    confirm().then(() => {
      removeMutation({ variables: { _id: integration._id } })
        .then(() => {
          Alert.success('Congrats');
        })

        .catch(error => {
          Alert.error(error.reason);
        });
    });
  };

  const updatedProps = {
    ...props,
    integrations,
    removeIntegration,
    loading: integrationsQuery.loading
  };

  return <IntegrationList {...updatedProps} />;
};

IntegrationListContainer.propTypes = {
  integrationsQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ kind, variables }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          ...variables,
          kind
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(mutations.integrationsRemove), {
    name: 'removeMutation',
    options: ({ kind }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              kind
            }
          },
          {
            query: gql(queries.integrationTotalCount)
          }
        ]
      };
    }
  })
)(IntegrationListContainer);
