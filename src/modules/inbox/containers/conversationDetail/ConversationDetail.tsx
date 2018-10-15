import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ConversationDetail } from 'modules/inbox/components/conversationDetail';
import { mutations, queries, subscriptions } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';

type Props = {
  detailQuery: any;
  currentId: string;
  markAsReadMutation: (doc: { variables: { _id: string } }) => Promise<any>;
  currentUser: IUser;
};

class DetailContainer extends React.Component<Props> {
  private prevSubscriptions;

  constructor(props) {
    super(props);

    this.prevSubscriptions = null;
  }

  componentWillReceiveProps(nextProps) {
    const { currentId, detailQuery } = nextProps;

    // if conversation id changed. then unsubscribe previous subscriptions
    if (this.prevSubscriptions && this.props.currentId !== currentId) {
      const { detailHandler, customerHandler } = this.prevSubscriptions;

      if (detailHandler) {
        detailHandler();
      }

      if (customerHandler) {
        customerHandler();
      }

      this.prevSubscriptions = null;
    }

    if (detailQuery.loading) {
      return;
    }

    if (!detailQuery.conversationDetail) {
      return;
    }

    if (this.prevSubscriptions) {
      return;
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

    if (conversation.integration.kind === 'messenger') {
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

  render() {
    const {
      currentId,
      detailQuery = {},
      markAsReadMutation,
      currentUser
    } = this.props;

    const loading = detailQuery.loading;
    const conversation = detailQuery.conversationDetail;

    // mark as read ============
    if (!loading && conversation) {
      const readUserIds = conversation.readUserIds || [];

      if (!readUserIds.includes(currentUser._id)) {
        markAsReadMutation({
          variables: { _id: conversation._id }
        }).catch(e => {
          Alert.error(e.message);
        });
      }
    }

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation: conversation,
      loading
    };

    return <ConversationDetail {...updatedProps} />;
  }
}

const WithQuery = compose(
  graphql(gql(queries.conversationDetail), {
    name: 'detailQuery',
    options: ({ currentId }: { currentId: string }) => ({
      variables: { _id: currentId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.markAsRead), {
    name: 'markAsReadMutation',
    options: ({ currentId }: { currentId: string }) => {
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

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
