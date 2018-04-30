import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql } from 'react-apollo';
import { ConversationItem as DumbConversationItem } from '../components';
import NotificationSubscriber from './NotificationSubscriber';
import graphqTypes from './graphql';

class ConversationItem extends NotificationSubscriber {
  render() {
    const extendedProps = {
      ...this.props,
      notificationCount: this.props.data.unreadCount,
    };

    return <DumbConversationItem { ...extendedProps } />;
  }
}

ConversationItem.propTypes = {
  data: PropTypes.object.isRequired,
};

export default graphql(
  gql(graphqTypes.unreadCountQuery),
  {
    options: (ownProps) => ({
      variables: { conversationId: ownProps.conversation._id },
    }),
  }
)(ConversationItem);
