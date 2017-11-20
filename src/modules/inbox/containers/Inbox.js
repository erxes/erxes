import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert, router as routerUtils } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { Inbox as InboxComponent } from '../components';
import { queries, mutations, subscriptions } from '../graphql';
import { generateParams } from '../utils';

class ConversationDetail extends Component {
  componentWillMount() {
    const { currentConversationId, conversationDetailQuery } = this.props;
    this.subscribe(conversationDetailQuery, currentConversationId);
  }

  componentWillReceiveProps(nextProps) {
    const { currentConversationId, conversationDetailQuery } = this.props;

    if (nextProps.currentConversationId !== currentConversationId) {
      this.subscribe(conversationDetailQuery, nextProps.currentConversationId);
    }
  }

  subscribe(conversationDetailQuery, currentConversationId) {
    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationMessageInserted),
      variables: { _id: currentConversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail;
        const messages = conversationDetail.messages;

        // check whether or not already inserted
        const prevEntry = messages.find(m => m._id === message._id);

        // add new message to messages list
        const next = Object.assign({}, prev, {
          conversationDetail: Object.assign({
            ...conversationDetail,
            messages: [...messages, message]
          })
        });

        if (prevEntry) {
          return next;
        }

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
  }

  render() {
    const {
      currentConversationId,
      conversationDetailQuery,
      changeStatusMutation,
      markAsReadMutation
    } = this.props;

    const { currentUser } = this.context;
    const loading = conversationDetailQuery.loading;
    const currentConversation =
      conversationDetailQuery.conversationDetail || {};
    // =============== actions

    const changeStatus = (conversationId, status) => {
      changeStatusMutation({ variables: { _ids: [conversationId], status } })
        .then(() => {
          if (status === 'closed') {
            Alert.success('The conversation has been resolved!');
          } else {
            Alert.info(
              'The conversation has been reopened and restored to Inbox.'
            );
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // after tags
    const afterTag = () => {
      conversationDetailQuery.refetch();
    };

    // mark as read
    const readUserIds = currentConversation.readUserIds || [];

    if (!loading && !readUserIds.includes(currentUser._id)) {
      markAsReadMutation({
        variables: { _id: currentConversation._id }
      })
        .then(() => {
          conversationDetailQuery.refetch();
        })

        .catch(e => {
          Alert.error(e.message);
        });
    }

    const updatedProps = {
      ...this.props,
      currentConversationId,
      currentConversation,
      changeStatus,
      afterTag
    };

    return <InboxComponent {...updatedProps} />;
  }
}

ConversationDetail.propTypes = {
  conversationDetailQuery: PropTypes.object,
  changeStatusMutation: PropTypes.func.isRequired,
  currentConversationId: PropTypes.string.isRequired,
  markAsReadMutation: PropTypes.func.isRequired
};

const ConversationDetailContainer = compose(
  graphql(gql(queries.conversationDetail), {
    name: 'conversationDetailQuery',
    options: ({ currentConversationId }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: { _id: currentConversationId }
      };
    }
  }),
  graphql(gql(mutations.conversationsChangeStatus), {
    name: 'changeStatusMutation'
  }),
  graphql(gql(mutations.markAsRead), {
    name: 'markAsReadMutation'
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

  if (lastConversationQuery.loading) {
    return <Spinner />;
  }

  const lastConversation = lastConversationQuery.conversationsGetLast;

  if (!lastConversation) {
    return null;
  }

  const currentConversationId = lastConversation._id;

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
  const { _id } = props;

  const onChangeConversation = conversation => {
    routerUtils.setParams(props.history, { _id: conversation._id });
  };

  const updatedProps = {
    ...props,
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
  _id: PropTypes.string
};

export default withRouter(Inbox);
