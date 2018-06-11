import React, { Component } from 'react';
import PropTypes from 'prop-types';
import client from 'apolloClient';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import gql from 'graphql-tag';
import { Alert, router as routerUtils } from 'modules/common/utils';
import { Inbox as InboxComponent, Empty } from '../components';
import { queries, mutations, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class ConversationDetail extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = { messages: [], loadingMessages: false };

    this.subscriptions = {};

    this.loadMoreMessages = this.loadMoreMessages.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.context;

    const { currentId, detailQuery, messagesQuery } = nextProps;

    if (currentId !== this.props.currentId) {
      this.setState({ messages: [], loadingMessages: true });
    }

    if (detailQuery.loading || messagesQuery.loading) {
      return;
    }

    const { conversationMessages } = messagesQuery;

    if (conversationMessages && this.state.messages.length === 0) {
      this.setState({ messages: conversationMessages, loadingMessages: false });
    }

    if (this.subscriptions[currentId]) {
      return;
    }

    this.subscriptions[currentId] = true;

    messagesQuery.subscribeToMore({
      document: gql(subscriptions.conversationMessageInserted),
      variables: { _id: currentId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversation = detailQuery.conversationDetail;

        // current user's message is being showed after insert message
        // mutation. So to prevent from duplication we are ignoring current
        // user's messages from subscription
        const isMessenger = conversation.integration.kind === 'messenger';

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

    // listen for conversation changes like status, assignee
    detailQuery.subscribeToMore({
      document: gql(subscriptions.conversationChanged),
      variables: { _id: currentId },
      updateQuery: () => {
        this.props.detailQuery.refetch();
      }
    });

    // listen for customer connection
    const conversation = detailQuery.conversationDetail;

    if (conversation && conversation.integration.kind === 'messenger') {
      const customerId = conversation.customer._id;

      detailQuery.subscribeToMore({
        document: gql(subscriptions.customerConnectionChanged),
        variables: { _id: customerId },
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const prevConv = prev.conversationDetail;
          const customerConnection = data.customerConnectionChanged;

          if (prevConv & (prevConv.customer._id === customerConnection._id)) {
            this.props.detailQuery.refetch();
          }
        }
      });
    }
  }

  addMessage({ variables, optimisticResponse, callback, kind }) {
    const { addMessageMutation } = this.props;

    addMessageMutation({ variables, optimisticResponse })
      .then(({ data: { conversationMessageAdd } }) => {
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
    const {
      currentId,
      detailQuery = {},
      messagesQuery = {},
      markAsReadMutation
    } = this.props;

    const { currentUser } = this.context;

    const loading = detailQuery.loading || messagesQuery.loading;

    const currentConversation = detailQuery.conversationDetail || {};
    const readUserIds = currentConversation.readUserIds || [];

    // mark as read ============
    if (!loading && !readUserIds.includes(currentUser._id) && currentId) {
      markAsReadMutation({
        variables: { _id: currentConversation._id }
      }).catch(e => {
        Alert.error(e.message);
      });
    }

    const { messages, loadingMessages } = this.state;

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation,
      conversationMessages: messages,
      loading,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      refetch: detailQuery.refetch,
      loadingMessages
    };

    return <InboxComponent {...updatedProps} />;
  }
}

ConversationDetail.propTypes = {
  detailQuery: PropTypes.object,
  messagesQuery: PropTypes.object,
  messagesTotalCountQuery: PropTypes.object,
  currentId: PropTypes.string.isRequired,
  markAsReadMutation: PropTypes.func.isRequired,
  addMessageMutation: PropTypes.func,
  history: PropTypes.object
};

const ConversationDetailContainer = compose(
  graphql(gql(queries.conversationDetail), {
    name: 'detailQuery',
    options: ({ currentId }) => ({
      variables: { _id: currentId },
      fetchPolicy: 'network-only'
    })
  }),
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
  graphql(gql(mutations.markAsRead), {
    name: 'markAsReadMutation',
    options: ({ currentId }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.conversationDetailMarkAsRead),
            variables: { _id: currentId }
          },
          { query: gql(queries.unreadConversationsCount) }
        ]
      };
    }
  }),
  graphql(gql(mutations.conversationMessageAdd), { name: 'addMessageMutation' })
)(ConversationDetail);

ConversationDetail.contextTypes = {
  currentUser: PropTypes.object
};

class WithCurrentId extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { lastConversationQuery, history, queryParams } = nextProps;
    const { _id } = queryParams;

    const lastConversation = lastConversationQuery
      ? lastConversationQuery.conversationsGetLast
      : {};

    if (!_id && lastConversation) {
      routerUtils.setParams(history, { _id: lastConversation._id });
    }
  }

  render() {
    const { queryParams: { _id } } = this.props;

    if (!_id) {
      return <Empty {...this.props} />;
    }

    const updatedProps = {
      ...this.props,
      currentId: _id
    };

    return <ConversationDetailContainer {...updatedProps} />;
  }
}

WithCurrentId.propTypes = {
  lastConversationQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object
};

const Inbox = compose(
  graphql(gql(queries.lastConversation), {
    name: 'lastConversationQuery',
    options: ({ queryParams }) => ({
      skip: queryParams._id,
      variables: generateParams(queryParams),
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = props => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <Inbox {...extendedProps} />;
};

WithQueryParams.propTypes = {
  location: PropTypes.object
};

export default withRouter(WithQueryParams);
