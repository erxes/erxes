import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import { IntegrationList } from '../components';

const IntegrationListContainer = props => {
  const {
    integrationsQuery,
    allIntegrationsQuery,
    channelDetailQuery,
    totalCountQuery,
    addMutation,
    editMutation
  } = props;

  const totalCount = totalCountQuery.integrationsTotalCount || 0;
  const channelDetail = channelDetailQuery.channelDetail || {};
  const integrations = integrationsQuery.integrations || [];

  // create or update action
  const save = ({ doc }, callback, channel) => {
    let mutation = addMutation;
    // if edit mode
    if (channel) {
      mutation = editMutation;
      doc._id = channel._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        // update queries
        integrationsQuery.refetch();
        channelDetailQuery.refetch();

        Alert.success('Successfully saved');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    channelDetail,
    integrations,
    totalCount,
    allIntegrationsQuery,
    save,
    refetch: integrationsQuery.refetch,
    loading: integrationsQuery.loading
  };

  return <IntegrationList {...updatedProps} />;
};

IntegrationListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  integrationsQuery: PropTypes.object,
  allIntegrationsQuery: PropTypes.object,
  channelDetailQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
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
  graphql(gql(queries.integrations), {
    name: 'allIntegrationsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'totalCountQuery'
  }),
  graphql(gql(mutations.channelAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.channelEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.channelRemove), {
    name: 'removeMutation'
  })
)(IntegrationListContainer);
