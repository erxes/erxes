import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
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

  const name = 'channels';
  const totalCount = totalCountQuery[`${name}TotalCount`] || 0;
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

const commonParamsDef = `
  $name: String!,
  $description: String,
  $memberIds: [String],
  $integrationIds: [String]
`;

const commonParams = `
  name: $name,
  description: $description,
  memberIds: $memberIds,
  integrationIds: $integrationIds
`;

export default compose(
  graphql(
    gql`
      query integrations($channelId: String, $perPage: Int) {
        integrations(channelId: $channelId, perPage: $perPage) {
          _id
          name
          kind
          brand {
            _id
            name
          }
          channels {
            _id
            name
          }
        }
      }
    `,
    {
      name: 'integrationsQuery',
      options: ({ queryParams }) => ({
        variables: {
          channelId: queryParams.id,
          perPage: 20
        },
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(
    gql`
      query integrations($channelId: String, $perPage: Int) {
        integrations(channelId: $channelId, perPage: $perPage) {
          _id
          name
        }
      }
    `,
    {
      name: 'allIntegrationsQuery',
      options: {
        variables: {
          perPage: 20
        }
      }
    }
  ),
  graphql(
    gql`
      query channelDetail($_id: String!) {
        channelDetail(_id: $_id) {
          _id
          name
          integrationIds
          memberIds
        }
      }
    `,
    {
      name: 'channelDetailQuery',
      options: ({ queryParams }) => ({
        variables: { _id: queryParams.id },
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(
    gql`
      query totalChannelsCount {
        channelsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),
  graphql(
    gql`
      mutation channelsAdd(${commonParamsDef}) {
        channelsAdd(${commonParams}) {
          _id
        }
      }
    `,
    { name: 'addMutation' }
  ),

  graphql(
    gql`
      mutation channelsEdit($_id: String!, ${commonParamsDef}) {
        channelsEdit(_id: $_id, ${commonParams}) {
          _id
        }
      }
    `,
    { name: 'editMutation' }
  ),

  graphql(
    gql`
      mutation channelsRemove($_id: String!) {
        channelsRemove(_id: $_id)
      }
    `,
    { name: 'removeMutation' }
  )
)(IntegrationListContainer);
