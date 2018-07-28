import * as React from 'react';
import * as PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import * as gql from 'graphql-tag';
import { ConversationItem as DumbConversationItem } from '../components';
import graphqlTypes from '../graphql';

class ConversationItem extends React.Component {
  componentWillMount() {
    const { data, conversation } = this.props;

    // lister for all conversation changes for this customer
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversation._id },
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
  conversation: PropTypes.object.isRequired,
};

export default graphql(
  gql(graphqlTypes.unreadCountQuery),
  {
    options: (props) => ({
      variables: { conversationId: props.conversation._id },
    })
  }
)(ConversationItem);
