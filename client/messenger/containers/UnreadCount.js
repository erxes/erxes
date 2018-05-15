import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql } from 'react-apollo';
import { UnreadCount as DumbUnreadCount } from '../components';
import { connection } from '../connection';
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
  gql`
    query totalUnreadCount(${connection.queryVariables}) {
      totalUnreadCount(${connection.queryParams})
    }
  `,

  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(UnreadCount);
