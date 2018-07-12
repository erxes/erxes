import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connection } from '../connection';
import { ConversationItem as DumbConversationItem } from '../components';
import graphqlTypes from '../graphql';

class ConversationItem extends React.Component {
  componentWillMount() {
    const { data } = this.props;

    // lister for all conversation changes for this customer
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationsChangedSubscription),
      variables: { customerId: connection.data.customerId },
      updateQuery: () => {
        data.refetch();
      },
    });
  }

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
  gql(graphqlTypes.unreadCountQuery),
  {
    options: (ownProps) => ({
      variables: { conversationId: ownProps.conversation._id },
    }),
  }
)(ConversationItem);
