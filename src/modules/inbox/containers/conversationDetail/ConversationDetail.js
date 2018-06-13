import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ConversationDetail } from 'modules/inbox/components/conversationDetail';
import { queries, mutations, subscriptions } from 'modules/inbox/graphql';

class DetailContainer extends Component {
  constructor(props, context) {
    super(props, context);

    this.prevSubscriptions = null;
  }

  componentWillReceiveProps(nextProps) {
    const { currentId, detailQuery } = nextProps;

    // It is first time or subsequent conversation change
    if (!this.prevSubscriptions || currentId !== this.props.currentId) {
      // Unsubscribe previous subscriptions ==========
      if (this.prevSubscriptions) {
        const { detailHandler, customerHandler } = this.prevSubscriptions;

        detailHandler && detailHandler();
        customerHandler && customerHandler();
      }

      // Start new subscriptions =============
      this.prevSubscriptions = {};

      // listen for conversation changes like status, assignee
      this.prevSubscriptions.detailHandler = detailQuery.subscribeToMore({
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

        this.prevSubscriptions.customerHandler = detailQuery.subscribeToMore({
          document: gql(subscriptions.customerConnectionChanged),
          variables: { _id: customerId },
          updateQuery: (prev, { subscriptionData: { data } }) => {
            const prevConv = prev.conversationDetail;
            const customerConnection = data.customerConnectionChanged;

            if (prevConv && prevConv.customer._id === customerConnection._id) {
              this.props.detailQuery.refetch();
            }
          }
        });
      }
    }
  }

  render() {
    const { currentId, detailQuery = {}, markAsReadMutation } = this.props;
    const { currentUser } = this.context;

    const loading = detailQuery.loading;
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

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation,
      loading
    };

    return <ConversationDetail {...updatedProps} />;
  }
}

DetailContainer.propTypes = {
  detailQuery: PropTypes.object,
  currentId: PropTypes.string.isRequired,
  markAsReadMutation: PropTypes.func
};

DetailContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  graphql(gql(queries.conversationDetail), {
    name: 'detailQuery',
    options: ({ currentId }) => ({
      variables: { _id: currentId },
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
)(DetailContainer);
