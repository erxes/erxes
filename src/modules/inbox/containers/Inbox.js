import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, router as routerUtils } from 'modules/common/utils';
import { Inbox as InboxComponent } from '../components';
import { queries, mutations, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class InboxContainer extends Component {
  constructor(props, context) {
    super(props, context);

    this.subscriptions = {};
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.context;
    const prevCurrentId = this.props.queryParams._id;

    if (!prevCurrentId) return;

    const { queryParams, detailQuery, messagesQuery } = nextProps;
    const { _id } = queryParams;

    if (detailQuery.loading || messagesQuery.loading) {
      return;
    }

    if (this.subscriptions[_id]) {
      return;
    }

    this.subscriptions[_id] = true;

    messagesQuery.subscribeToMore({
      document: gql(subscriptions.conversationMessageInserted),
      variables: { _id },
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

        if (_id !== prevCurrentId) {
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
      variables: { _id },
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

  render() {
    const {
      detailQuery = {},
      messagesQuery = {},
      markAsReadMutation,
      lastConversationQuery = {},
      history,
      queryParams
    } = this.props;

    const { currentUser } = this.context;
    const lastConversation = lastConversationQuery.conversationsGetLast;

    if (!queryParams._id && lastConversation) {
      routerUtils.setParams(history, { _id: lastConversation._id });
    }

    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const loading = detailQuery.loading || messagesQuery.loading;

    const currentConversation = detailQuery.conversationDetail || {};
    const conversationMessages = messagesQuery.conversationMessages || [];
    const readUserIds = currentConversation.readUserIds || [];
    const { _id } = queryParams;

    // mark as read ============
    if (!loading && !readUserIds.includes(currentUser._id) && _id) {
      markAsReadMutation({
        variables: { _id: currentConversation._id }
      }).catch(e => {
        Alert.error(e.message);
      });
    }

    const updatedProps = {
      ...this.props,
      currentConversationId: _id,
      currentConversation,
      conversationMessages,
      loading,
      refetch: detailQuery.refetch,
      onChangeConversation
    };

    return <InboxComponent {...updatedProps} />;
  }
}

InboxContainer.propTypes = {
  detailQuery: PropTypes.object,
  messagesQuery: PropTypes.object,
  markAsReadMutation: PropTypes.func.isRequired,
  lastConversationQuery: PropTypes.object,
  history: PropTypes.object,
  queryParams: PropTypes.object
};

InboxContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  graphql(gql(queries.conversationDetail), {
    name: 'detailQuery',
    options: ({ queryParams }) => ({
      skip: !queryParams._id,
      variables: { _id: queryParams._id },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.lastConversation), {
    name: 'lastConversationQuery',
    options: ({ queryParams }) => ({
      skip: queryParams._id,
      variables: generateParams(queryParams),
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.conversationMessages), {
    name: 'messagesQuery',
    options: ({ queryParams }) => ({
      skip: !queryParams._id,
      variables: { conversationId: queryParams._id },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.markAsRead), {
    name: 'markAsReadMutation',
    options: ({ queryParams }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.conversationDetailMarkAsRead),
            variables: { _id: queryParams._id }
          },
          { query: gql(queries.unreadConversationsCount) }
        ]
      };
    }
  })
)(InboxContainer);
