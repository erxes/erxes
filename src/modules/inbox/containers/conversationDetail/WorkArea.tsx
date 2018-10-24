import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { WorkArea as DumbWorkArea } from 'modules/inbox/components/conversationDetail';
import { mutations, queries, subscriptions } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { IConversation, IMessage } from '../../types';

// messages limit
let limit = 10;
let skip;

export interface IAddMessage {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  tweetReplyToId?: string;
  tweetReplyToScreenName?: string;
  commentReplyToId?: string;
}

type Props = {
  currentUser: IUser;
  messagesQuery: any;
  messagesTotalCountQuery: any;
  currentConversation: IConversation;
  currentId: string;
  addMessageMutation: (
    doc: {
      variables: IAddMessage;
      optimisticResponse: any;
      update: any;
    }
  ) => Promise<any>;
  history: any;
};

type State = {
  loadingMessages: boolean;
};

class WorkArea extends React.Component<Props, State> {
  private prevSubscription;

  constructor(props) {
    super(props);

    this.state = { loadingMessages: false };

    this.prevSubscription = null;
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.props;

    const { currentId, currentConversation, messagesQuery } = nextProps;

    // It is first time or subsequent conversation change
    if (!this.prevSubscription || currentId !== this.props.currentId) {
      // Unsubscribe previous subscription ==========
      if (this.prevSubscription) {
        this.prevSubscription();
      }

      // Start new subscriptions =============
      this.prevSubscription = messagesQuery.subscribeToMore({
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
            return;
          }

          const messages = prev.conversationMessages;

          // Sometimes it is becoming undefined because of left sidebar query
          if (!messages) {
            return;
          }

          // check whether or not already inserted
          const prevEntry = messages.find(m => m._id === message._id);

          if (prevEntry) {
            return;
          }

          // add new message to messages list
          const next = {
            ...prev,
            conversationMessages: [...messages, message]
          };

          return next;
        }
      });
    }
  }

  addMessage = ({
    variables,
    optimisticResponse,
    callback,
    kind
  }: {
    variables: any;
    optimisticResponse: any;
    callback?: (e?) => void;
    kind: string;
  }) => {
    const { addMessageMutation, currentId } = this.props;

    // immidiate ui update =======
    let update;

    if (optimisticResponse) {
      update = (proxy, { data: { conversationMessageAdd } }) => {
        const message = conversationMessageAdd;

        const optimisticResponseVariables = {
          conversationId: currentId,
          limit,
          skip: undefined
        };

        if (skip) {
          optimisticResponseVariables.skip = skip;
        }

        const selector = {
          query: gql(queries.conversationMessages),
          variables: optimisticResponseVariables
        };

        // Read the data from our cache for this query.
        let data;

        try {
          data = proxy.readQuery(selector);

          // Do not do anything while reading query somewhere else
        } catch (e) {
          return;
        }

        const messages = data.conversationMessages;

        // check duplications
        if (messages.find(m => m._id === message._id)) {
          return;
        }

        // Add our comment from the mutation to the end.
        messages.push(message);

        // Write our data back to the cache.
        proxy.writeQuery({ ...selector, data });
      };
    }

    addMessageMutation({ variables, optimisticResponse, update })
      .then(() => {
        if (callback) {
          callback();
        }
      })
      .catch(e => {
        if (callback) {
          callback(e);
        }
      });
  };

  loadMoreMessages = () => {
    const { currentId, messagesTotalCountQuery, messagesQuery } = this.props;
    const { conversationMessagesTotalCount } = messagesTotalCountQuery;
    const { conversationMessages } = messagesQuery;

    const loading = messagesQuery.loading || messagesTotalCountQuery.loading;
    const hasMore =
      conversationMessagesTotalCount > conversationMessages.length;

    if (!loading && hasMore) {
      this.setState({ loadingMessages: true });

      limit = 10;
      skip = conversationMessages.length;

      messagesQuery.fetchMore({
        variables: {
          conversationId: currentId,
          limit,
          skip
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          this.setState({ loadingMessages: false });

          if (!fetchMoreResult) {
            return prev;
          }

          const prevMessageIds = (prev.conversationMessages || []).map(
            m => m._id
          );

          const fetchedMessages: IMessage[] = [];

          for (const message of fetchMoreResult.conversationMessages) {
            if (!prevMessageIds.includes(message._id)) {
              fetchedMessages.push(message);
            }
          }

          return {
            ...prev,
            conversationMessages: [
              ...fetchedMessages,
              ...prev.conversationMessages
            ]
          };
        }
      });
    }
  };

  render() {
    const { loadingMessages } = this.state;
    const { messagesQuery } = this.props;
    const conversationMessages = messagesQuery.conversationMessages || [];

    const updatedProps = {
      ...this.props,
      conversationMessages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loading: messagesQuery.loading || loadingMessages
    };

    return <DumbWorkArea {...updatedProps} />;
  }
}

const WithQuery = compose(
  graphql(gql(queries.conversationMessages), {
    name: 'messagesQuery',
    options: ({ currentId }: { currentId: string }) => {
      const windowHeight = window.innerHeight;

      // 330 - height of above and below sections of detail area
      // 45 -  min height of per message
      limit = Math.round((windowHeight - 330) / 45 + 1);
      skip = null;

      return {
        variables: {
          conversationId: currentId,
          limit
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(queries.conversationMessagesTotalCount), {
    name: 'messagesTotalCountQuery',
    options: ({ currentId }: { currentId: string }) => ({
      variables: { conversationId: currentId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'addMessageMutation',
    options: ({ currentId }: { currentId: string }) => ({
      refetchQueries: ['conversationMessages']
    })
  })
)(WorkArea);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
