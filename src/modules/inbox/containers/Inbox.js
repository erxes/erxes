import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import queryString from 'query-string';
import { Alert, router as routerUtils } from 'modules/common/utils';
import { Inbox as InboxComponent } from '../components';
import { queries, mutations, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class ConversationDetail extends Component {
  componentWillReceiveProps(nextProps) {
    const { history } = this.props;

    if (
      !routerUtils.getParam(history, '_id') &&
      this.props.currentConversationId
    ) {
      routerUtils.setParams(history, { _id: this.props.currentConversationId });
    }

    const { currentConversationId, conversationDetailQuery } = nextProps;

    if (conversationDetailQuery.loading) {
      return;
    }

    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationMessageInserted),
      variables: { _id: currentConversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail;
        const messages = conversationDetail.messages;

        if (currentConversationId !== this.props.currentConversationId) {
          return prev;
        }

        // check whether or not already inserted
        const prevEntry = messages.find(m => m._id === message._id);

        if (prevEntry) {
          return prev;
        }

        // add new message to messages list
        const next = Object.assign({}, prev, {
          conversationDetail: Object.assign({
            ...conversationDetail,
            messages: [...messages, message]
          })
        });

        return next;
      }
    });

    // listen for conversation changes like status, assignee
    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationChanged),
      variables: { _id: currentConversationId },
      updateQuery: () => {
        this.props.conversationDetailQuery.refetch();
      }
    });

    // listen for customer connection
    const conversation = conversationDetailQuery.conversationDetail;

    if (conversation && conversation.integration.kind === 'messenger') {
      const customerId = conversation.customer._id;

      conversationDetailQuery.subscribeToMore({
        document: gql(subscriptions.customerConnectionChanged),
        variables: { _id: customerId },
        updateQuery: (prev, { subscriptionData }) => {
          const prevConversation = prev.conversationDetail;
          const customerConnection =
            subscriptionData.data.customerConnectionChanged;

          if (prevConversation.customer._id === customerConnection._id) {
            this.props.conversationDetailQuery.refetch();
          }
        }
      });
    }
  }

  render() {
    const {
      currentConversationId,
      conversationDetailQuery,
      markAsReadMutation
    } = this.props;

    const { currentUser } = this.context;
    const loading = conversationDetailQuery.loading;
    const currentConversation =
      conversationDetailQuery.conversationDetail || {};

    // mark as read
    const readUserIds = currentConversation.readUserIds || [];

    if (
      !loading &&
      !readUserIds.includes(currentUser._id) &&
      currentConversationId
    ) {
      markAsReadMutation({
        variables: { _id: currentConversation._id }
      }).catch(e => {
        Alert.error(e.message);
      });
    }

    const updatedProps = {
      ...this.props,
      currentConversationId,
      currentConversation,
      loading,
      refetch: conversationDetailQuery.refetch
    };

    return <InboxComponent {...updatedProps} />;
  }
}

ConversationDetail.propTypes = {
  conversationDetailQuery: PropTypes.object,
  currentConversationId: PropTypes.string.isRequired,
  markAsReadMutation: PropTypes.func.isRequired,
  history: PropTypes.object
};

const ConversationDetailContainer = compose(
  graphql(gql(queries.conversationDetail), {
    name: 'conversationDetailQuery',
    options: ({ currentConversationId }) => {
      return {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
        variables: { _id: currentConversationId }
      };
    }
  }),
  graphql(gql(mutations.markAsRead), {
    name: 'markAsReadMutation',
    options: ({ currentConversationId }) => {
      return {
        refetchQueries: [
          {
            query: gql`
              query conversationDetail($_id: String!) {
                conversationDetail(_id: $_id) {
                  _id
                  readUserIds
                }
              }
            `,
            variables: { _id: currentConversationId }
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

/*
 * We will use this component when there is not current conversation id
 * in query string
 */
const LastConversation = props => {
  const { lastConversationQuery } = props;

  const lastConversation = lastConversationQuery.conversationsGetLast || {};

  const currentConversationId = lastConversation._id || '';

  const updatedProps = {
    ...props,
    currentConversationId
  };

  return <ConversationDetailContainer {...updatedProps} />;
};

LastConversation.propTypes = {
  lastConversationQuery: PropTypes.object
};

const LastConversationContainer = compose(
  graphql(gql(queries.lastConversation), {
    name: 'lastConversationQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generateParams(queryParams)
    })
  })
)(LastConversation);

/*
 * Main inbox component
 */
const Inbox = props => {
  const queryParams = queryString.parse(props.location.search);
  const _id = queryParams._id;

  const onChangeConversation = conversation => {
    routerUtils.setParams(props.history, { _id: conversation._id });
  };

  const updatedProps = {
    ...props,
    queryParams,
    onChangeConversation
  };

  if (_id) {
    updatedProps.currentConversationId = _id;

    return <ConversationDetailContainer {...updatedProps} />;
  }

  return <LastConversationContainer {...updatedProps} />;
};

Inbox.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(Inbox);
