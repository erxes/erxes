import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import { Sidebar } from '../components';

const SidebarContainer = props => {
  const {
    channelsQuery,
    usersQuery,
    addMutation,
    editMutation,
    removeMutation
  } = props;

  const channels = channelsQuery.channels || [];
  const members = usersQuery.users || [];

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          // update queries
          channelsQuery.refetch();
          usersQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

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
        channelsQuery.refetch();
        usersQuery.refetch();

        Alert.success('Successfully saved!');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...this.props,
    refetch: channelsQuery.refetch,
    channels,
    members,
    save,
    remove,
    loading: channelsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

SidebarContainer.propTypes = {
  usersQuery: PropTypes.object,
  channelsQuery: PropTypes.object,
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
      query channels($page: Int, $perPage: Int, $memberIds: [String]) {
        channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
          _id
          name
          description
          integrationIds
          memberIds
        }
      }
    `,
    {
      name: 'channelsQuery',
      options: () => {
        return {
          notifyOnNetworkStatusChange: true,
          perPage: 20
        };
      }
    }
  ),
  graphql(
    gql`
      query users {
        users {
          _id
          details {
            avatar
            fullName
            position
            twitterUsername
          }
        }
      }
    `,
    {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
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
)(SidebarContainer);
