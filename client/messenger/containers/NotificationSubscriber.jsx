import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connection } from '../connection';

export default class NotificationSubscriber extends React.Component {
  componentWillMount() {
    const { data } = this.props;

    // lister for all conversation changes for this customer
    data.subscribeToMore({
      document: gql`
        subscription conversationsChanged($customerId: String) {
          conversationsChanged(customerId: $customerId) {
            type
          }
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
