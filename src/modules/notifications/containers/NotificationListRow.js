import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { NotificationListRow } from '../components';
import { queries } from '../graphql';

class NotificationListRowContainer extends React.Component {
  render() {
    const { userDetailQuery } = this.props;

    if (userDetailQuery.loading) {
      return <Loading title="Notifications" />;
    }

    const createdUser = userDetailQuery.userDetail;

    const updatedProps = {
      ...this.props,

      createdUser
    };

    return <NotificationListRow {...updatedProps} />;
  }
}

NotificationListRowContainer.propTypes = {
  notification: PropTypes.object,
  userDetailQuery: PropTypes.object,
  markAsRead: PropTypes.func
};

export default compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ notification }) => ({
      variables: {
        _id: notification.createdUser
      }
    })
  })
)(NotificationListRowContainer);
