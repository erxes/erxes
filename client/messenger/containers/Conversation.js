import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, gql, graphql } from 'react-apollo';
import { connection } from '../connection';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';
import graphqlTypes from './graphql';

class Conversation extends React.Component {
  componentWillMount() {
    const { messagesQuery, conversationId } = this.props;

    this.subscribe(messagesQuery, conversationId);
  }

  componentWillReceiveProps(nextProps) {
    // when new conversation, conversationId props will be null. So after first
    // message creation update subscription with new conversationId variable
    if (this.props.conversationId !== nextProps.conversationId) {
      this.subscribe(this.props.messagesQuery, nextProps.conversationId);
    }
  }

  subscribe(messagesQuery, conversationId) {
    // lister for new message
    return messagesQuery.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;

        const messages = prev.messages;

        // add new message to messages list
        const next = Object.assign({}, prev, {
          messages: [...messages, message]
        });

        return next;
      },
    });
  }

  render() {
    let {
      messagesQuery,
      conversationLastStaffQuery,
      isMessengerOnlineQuery,
    } = this.props;

    // show empty list while waiting
    if (
      messagesQuery.loading ||
      conversationLastStaffQuery.loading ||
      isMessengerOnlineQuery.loading
    ) {

      return null;
    }

    const extendedProps = {
      ...this.props,
      messages: messagesQuery.messages || [],
      user: conversationLastStaffQuery.conversationLastStaff,
      isOnline: isMessengerOnlineQuery.isMessengerOnline,
      data: connection.data,
    };

    return <DumbConversation {...extendedProps} />;
  }
}


const mapStateToProps = (state) => {
  const isNewConversation = !state.activeConversation;

  return {
    isObtainedEmail: state.isObtainedEmail,
    conversationId: state.activeConversation,
    isNewConversation,
  };
};

const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
});

const query = compose(
  graphql(
    gql(graphqlTypes.messagesQuery),
    {
      name: 'messagesQuery',
      options: ownProps => ({
        variables: {
          conversationId: ownProps.conversationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),

  graphql(
    gql(graphqlTypes.conversationLastStaffQuery),
    {
      name: 'conversationLastStaffQuery',
      options: ownProps => ({
        variables: {
          conversationId: ownProps.conversationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),

  graphql(
    gql(graphqlTypes.isMessengerOnlineQuery),
    {
      name: 'isMessengerOnlineQuery',
      options: () => ({
        variables: {
          integrationId: connection.data.integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  )
);

Conversation.propTypes = {
  conversationId: PropTypes.string,
  messagesQuery: PropTypes.object,
  conversationLastStaffQuery: PropTypes.object,
  isMessengerOnlineQuery: PropTypes.object,
}

export default connect(mapStateToProps, mapDisptachToProps)(query(Conversation));
