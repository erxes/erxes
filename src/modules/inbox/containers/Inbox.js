import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import client from 'apolloClient';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { Alert, router as routerUtils } from 'modules/common/utils';
import { Inbox as InboxComponent } from '../components';
import { queries, mutations, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class ConversationDetail extends Component {
  constructor(props, context) {
    super(props, context);

    this.subscriptions = {};
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.context;

    const { currentId, detailQuery, messagesQuery } = nextProps;

    if (detailQuery.loading || messagesQuery.loading) {
      return;
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

        // add new message to messages list
        const next = {
          conversationMessages: [...messages, message]
        };

        return next;
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
          const prevConversation = prev.conversationDetail;
          const customerConnection = data.customerConnectionChanged;

          if (prevConversation.customer._id === customerConnection._id) {
            this.props.detailQuery.refetch();
          }
        }
      });
    }
  }

  loadMoreMessages(variables, callback) {
    client
      .query({
        query: gql(queries.conversationMessages),
        fetchPolicy: 'network-only',
        variables
      })
      .then(({ data }) => {
        callback && callback(data.conversationMessages);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  render() {
    const {
      history,
      currentId,
      detailQuery,
      messagesQuery,
      markAsReadMutation,
      messagesTotalCountQuery
    } = this.props;

    const { currentUser } = this.context;

    const loading =
      detailQuery.loading ||
      messagesQuery.loading ||
      messagesTotalCountQuery.loading;

    const currentConversation = detailQuery.conversationDetail || {};
    const conversationMessages = messagesQuery.conversationMessages || [];
    const readUserIds = currentConversation.readUserIds || [];

    // mark as read ============
    if (!loading && !readUserIds.includes(currentUser._id) && currentId) {
      markAsReadMutation({
        variables: { _id: currentConversation._id }
      }).catch(e => {
        Alert.error(e.message);
      });
    }

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation,
      conversationMessages,
      loading,
      onChangeConversation,
      loadMoreMessages: this.loadMoreMessages,
      messagesTotalCount:
        messagesTotalCountQuery.conversationMessagesTotalCount,
      refetch: detailQuery.refetch
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
    options: ({ currentId }) => ({
      variables: {
        conversationId: currentId,
        limit: 6
      },
      fetchPolicy: 'network-only'
    })
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
  })
)(ConversationDetail);

ConversationDetail.contextTypes = {
  currentUser: PropTypes.object
};

class WithCurrentId extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { lastConversationQuery, history, location } = nextProps;
    const queryParams = queryString.parse(location.search);
    const { _id } = queryParams;

    const lastConversation = lastConversationQuery
      ? lastConversationQuery.conversationsGetLast
      : {};

    if (!_id && lastConversation) {
      routerUtils.setParams(history, { _id: lastConversation._id });
    }
  }

  render() {
    const queryParams = queryString.parse(this.props.location.search);

    const updatedProps = {
      ...this.props,
      queryParams,
      currentId: queryParams._id || ''
    };

    return <ConversationDetailContainer {...updatedProps} />;
  }
}

WithCurrentId.propTypes = {
  lastConversationQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(
  compose(
    graphql(gql(queries.lastConversation), {
      name: 'lastConversationQuery',
      options: ({ location }) => {
        const queryParams = queryString.parse(location.search);

        return {
          skip: queryParams._id,
          variables: generateParams(queryParams),
          fetchPolicy: 'network-only'
        };
      }
    })
  )(WithCurrentId)
);
