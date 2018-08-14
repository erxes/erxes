import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
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
        Alert.success('Successfully saved.');

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

const commonOptions = ({ queryParams, currentChannelId }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.channels),
        variables: { perPage: queryParams.limit || 20 },
        fetchPolicy: 'network-only'
      },
      {
        query: gql(queries.channelDetail),
        variables: { _id: currentChannelId || '' },
        fetchPolicy: 'network-only'
      },
      { query: gql(queries.channelsCount) },
      { query: gql(queries.users) }
    ]
  };
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
    name: 'addMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.channelEdit), {
    name: 'editMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.channelRemove), {
    name: 'removeMutation',
    options: commonOptions
  })
)(SidebarContainer);
