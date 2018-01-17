import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Sidebar } from '../components';

const SidebarContainer = props => {
  const {
    usersQuery,
    channelsQuery,
    channelsCountQuery,
    addMutation,
    editMutation,
    removeMutation
  } = props;

  const channels = channelsQuery.channels || [];
  const members = usersQuery.users || [];
  const channelsTotalCount = channelsCountQuery.channelsTotalCount || 0;

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
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
    ...props,
    members,
    channels,
    channelsTotalCount,
    save,
    remove,
    loading: channelsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

SidebarContainer.propTypes = {
  channelsQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  channelsCountQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.channels), {
    name: 'channelsQuery',
    options: ({ queryParams }) => ({
      variables: {
        perPage: queryParams.limit || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.users), {
    name: 'usersQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.channelsCount), {
    name: 'channelsCountQuery'
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
)(SidebarContainer);
