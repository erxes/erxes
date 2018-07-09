import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { UnreadCount as DumbUnreadCount } from '../components';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import NotificationSubscriber from './NotificationSubscriber';

class UnreadCount extends NotificationSubscriber {
  render() {
    return <DumbUnreadCount count={this.props.data.totalUnreadCount || 0} />;
  }
}

UnreadCount.propTypes = {
  data: PropTypes.object.isRequired,
};

export default graphql(
  gql(graphqTypes.totalUnreadCount),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(UnreadCount);
