import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connection } from '../connection';

export default class NotificationSubscriber extends React.Component {
  componentWillMount() {
    const { data } = this.props;

    // lister for new message insert
    data.subscribeToMore({
      document: gql`
        subscription conversationNotification($customerId: String) {
          conversationNotification(customerId: $customerId)
        }`
      ,

      variables: {
        customerId: connection.data.customerId,
      },

      updateQuery: () => {
        this.props.data.refetch();
      },
    });
  }
}

NotificationSubscriber.propTypes = {
  data: PropTypes.object,
}
