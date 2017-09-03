import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { gql, graphql, compose } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { pagination } from '/imports/react-ui/common';
import { ChannelList } from '../components';

const ChannelListContainer = props => {
  const { totalCountQuery, listQuery, queryParams } = props;

  if (totalCountQuery.loading || listQuery.loading) {
    return null;
  }

  const { loadMore, hasMore } = pagination(queryParams, totalCountQuery.totalChannelsCount);

  // remove action
  const removeChannel = id => {
    if (!confirm('Are you sure?')) return;

    Meteor.call('channels.remove', id, error => {
      if (!error) {
        // update queries
        listQuery.refetch();
        totalCountQuery.refetch();
      }

      if (error) {
        return Alert.error("Can't delete a channel", error.reason);
      }

      return Alert.success('Congrats', 'Channel has deleted.');
    });
  };

  // create or update action
  const saveChannel = (params, callback, channel) => {
    let methodName = 'channels.add';

    // if edit mode
    if (channel) {
      methodName = 'channels.edit';
      params.id = channel._id;
    }

    Meteor.call(methodName, params, error => {
      if (error) return Alert.error(error.reason);

      // update queries
      listQuery.refetch();
      totalCountQuery.refetch();

      Alert.success('Congrats');

      callback(error);
    });
  };

  const updatedProps = {
    ...props,
    channels: listQuery.channels,
    loadMore,
    hasMore,
    removeChannel,
    saveChannel,
  };

  return <ChannelList {...updatedProps} />;
};

ChannelListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  listQuery: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query channels($limit: Int!) {
        channels(limit: $limit) {
          _id
          name
          description
          integrationIds
          memberIds
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            limit: queryParams.limit || 10,
          },
        };
      },
    },
  ),
  graphql(
    gql`
      query totalChannelsCount {
        totalChannelsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),
)(ChannelListContainer);
