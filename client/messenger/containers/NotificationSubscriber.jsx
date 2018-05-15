import React from 'react';
import PropTypes from 'prop-types';
import { gql } from 'react-apollo';
import { connection } from '../connection';
import graphqlTypes from './graphql';

export default class NotificationSubscriber extends React.Component {
  componentWillUpdate(nextProps) {
    if (this.props.isEngageMessagesCreated !== nextProps.isEngageMessagesCreated) {
      this.props.data.refetch();
    }
  }

  componentWillMount() {
    const { data } = this.props;

    // lister for all conversation changes for this customer
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationsChangedSubscription),
      variables: { customerId: connection.data.customerId },
      updateQuery: () => {
        this.props.data.refetch();
      },
    });
  }
}

NotificationSubscriber.propTypes = {
  data: PropTypes.object,
  isEngageMessagesCreated: PropTypes.bool,
}
