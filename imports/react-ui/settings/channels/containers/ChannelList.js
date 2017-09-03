import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { gql, graphql, compose } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { pagination } from '/imports/react-ui/common';
import { ChannelList } from '../components';

const ChannelListContainer = props => {
  const { data, queryParams } = props;
  const { loading, channels } = data;

  if (loading) {
    return null;
  }

  const { loadMore, hasMore } = pagination(queryParams, 'channels.list.count');

  const removeChannel = id => {
    if (!confirm('Are you sure?')) return;

    Meteor.call('channels.remove', id, error => {
      if (!error) {
        // update list query
        data.refetch();
      }

      if (error) {
        return Alert.error("Can't delete a channel", error.reason);
      }

      return Alert.success('Congrats', 'Channel has deleted.');
    });
  };

  const saveChannel = (params, callback, channel) => {
    let methodName = 'channels.add';

    // if edit mode
    if (channel) {
      methodName = 'channels.edit';
      params.id = channel._id;
    }

    Meteor.call(methodName, params, error => {
      if (error) return Alert.error(error.reason);

      // update list query
      data.refetch();

      Alert.success('Congrats');

      callback(error);
    });
  };

  const updatedProps = {
    ...props,
    channels,
    loadMore,
    hasMore,
    removeChannel,
    saveChannel,
  };

  return <ChannelList {...updatedProps} />;
};

ChannelListContainer.propTypes = {
  data: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query channels {
        channels {
          _id
          name
          description
          integrationIds
          memberIds
        }
      }
    `,
  ),
)(ChannelListContainer);
