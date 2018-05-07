import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
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
    const { history } = this.props;
    const { currentUser } = this.context;

    const prevCurrentId = this.props.currentId;

    // add current conversation's _id to url
    if (!routerUtils.getParam(history, '_id') && prevCurrentId) {
      routerUtils.setParams(history, { _id: prevCurrentId });
    }

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

  render() {
    const {
      currentId,
      detailQuery,
      messagesQuery,
      markAsReadMutation
    } = this.props;

    const { currentUser } = this.context;

    const loading = detailQuery.loading || messagesQuery.loading;

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

    const storageKey = `erxes_sidebar_section_config`;

    const setSectionParams = params => {
      localStorage.setItem(storageKey, JSON.stringify(params));
    };

    if (!localStorage.getItem(storageKey)) {
      setSectionParams({
        showProfile: false,
        showCompany: false,
        showConversationDetail: false,
        showManageGroups: false,
        showDeal: false,
        showDeviceProperty: false,
        showMessenger: false,
        showFacebook: false,
        showTwitter: false,
        showTags: false,
        showOtherProperty: false
      });
    }

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation,
      conversationMessages,
      loading,
      refetch: detailQuery.refetch,
      sectionParams: JSON.parse(localStorage.getItem(storageKey)),
      setSectionParams
    };

    return <InboxComponent {...updatedProps} />;
  }
}

ConversationDetail.propTypes = {
  detailQuery: PropTypes.object,
  messagesQuery: PropTypes.object,
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

/*
 * We will use this component when there is not current conversation id
 * in query string
 */
const LastConversation = props => {
  const { lastConversationQuery } = props;

  const lastConversation = lastConversationQuery.conversationsGetLast || {};

  const currentId = lastConversation._id || '';

  const updatedProps = {
    ...props,
    currentId
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
      variables: generateParams(queryParams),
      fetchPolicy: 'network-only'
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
    updatedProps.currentId = _id;

    return <ConversationDetailContainer {...updatedProps} />;
  }

  return <LastConversationContainer {...updatedProps} />;
};

Inbox.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(Inbox);
