import React, { Component } from 'react';
import PropTypes from 'prop-types';
import client from 'apolloClient';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { WorkArea as DumbWorkArea } from 'modules/inbox/components/conversationDetail';
import { queries, mutations, subscriptions } from 'modules/inbox/graphql';

class WorkArea extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = { messages: [], loadingMessages: false };

    this.prevSubscriptions = {};

    this.loadMoreMessages = this.loadMoreMessages.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.context;

    const { currentId, currentConversation, messagesQuery } = nextProps;

    if (currentId !== this.props.currentId) {
      // Unsubscribe previous subscriptions ==========
      if (this.prevSubscriptions) {
        const { messagesHandler } = this.prevSubscriptions;

        messagesHandler && messagesHandler();
      }

      // Start new subscriptions =============
      this.prevSubscriptions.messagesHandler = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          const message = subscriptionData.data.conversationMessageInserted;

          // current user's message is being showed after insert message
          // mutation. So to prevent from duplication we are ignoring current
          // user's messages from subscription
          const isMessenger =
            currentConversation.integration.kind === 'messenger';

          if (isMessenger && message.userId === currentUser._id) {
            return;
          }

          if (currentId !== this.props.currentId) {
            return prev;
          }

          const messages = prev.conversationMessages;

          // check whether or not already inserted
          const prevEntry = messages.find(m => m._id === message._id);

          if (prevEntry) {
            return prev;
          }

          this.setState({ messages: [...this.state.messages, message] });
        }
      });

      this.setState({ messages: [], loadingMessages: true });
    }

    if (messagesQuery.loading) {
      return;
    }

    const { conversationMessages } = messagesQuery;

    if (conversationMessages && this.state.messages.length === 0) {
      this.setState({ messages: conversationMessages, loadingMessages: false });
    }
  }

  addMessage({ variables, optimisticResponse, callback, kind }) {
    const { addMessageMutation } = this.props;

    addMessageMutation({ variables, optimisticResponse })
      .then(({ data }) => {
        const { conversationMessageAdd } = data;

        if (kind === 'messenger') {
          const message = conversationMessageAdd;

          this.setState({ messages: [...this.state.messages, message] });
        }

        callback();
      })
      .catch(e => {
        callback(e);
      });
  }

  loadMoreMessages() {
    const { currentId, messagesTotalCountQuery } = this.props;
    const { messages } = this.state;
    const { loading, conversationMessagesTotalCount } = messagesTotalCountQuery;

    if (!loading && conversationMessagesTotalCount > messages.length) {
      this.setState({ loadingMessages: true });

      client
        .query({
          query: gql(queries.conversationMessages),
          fetchPolicy: 'network-only',
          variables: {
            conversationId: currentId,
            skip: messages.length,
            limit: 10
          }
        })
        .then(({ data }) => {
          const { conversationMessages } = data;

          if (conversationMessages) {
            this.setState({
              messages: [...conversationMessages, ...messages],
              loadingMessages: false
            });
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }
  }

  render() {
    const { messages, loadingMessages } = this.state;

    const updatedProps = {
      ...this.props,
      conversationMessages: messages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loadingMessages
    };

    return <DumbWorkArea {...updatedProps} />;
  }
}

WorkArea.propTypes = {
  messagesQuery: PropTypes.object,
  messagesTotalCountQuery: PropTypes.object,
  currentConversation: PropTypes.object,
  currentId: PropTypes.string.isRequired,
  addMessageMutation: PropTypes.func,
  history: PropTypes.object
};

export default compose(
  graphql(gql(queries.conversationMessages), {
    name: 'messagesQuery',
    options: ({ currentId }) => {
      const windowHeight = window.innerHeight;

      return {
        variables: {
          conversationId: currentId,
          // 330 - height of above and below sections of detail area
          // 45 -  min height of per message
          limit: parseInt((windowHeight - 330) / 45, 10) + 1
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(queries.conversationMessagesTotalCount), {
    name: 'messagesTotalCountQuery',
    options: ({ currentId }) => ({
      variables: { conversationId: currentId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'addMessageMutation'
  })
)(WorkArea);

WorkArea.contextTypes = {
  currentUser: PropTypes.object
};
