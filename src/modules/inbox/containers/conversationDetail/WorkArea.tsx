import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { WorkArea as DumbWorkArea } from 'modules/inbox/components/conversationDetail';
import { mutations, queries, subscriptions } from 'modules/inbox/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import {
  AddMessageMutationResponse,
  AddMessageMutationVariables,
  IConversation,
  IMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from '../../types';

// messages limit
let limit = 10;
let skip;

type Props = {
  currentConversation: IConversation;
  currentId?: string;
};

type FinalProps = {
  currentUser: IUser;
  messagesQuery: MessagesQueryResponse;
  messagesTotalCountQuery: MessagesTotalCountQuery;
} & Props &
  AddMessageMutationResponse;

type State = {
  loadingMessages: boolean;
  typingInfo?: string;
};

class WorkArea extends React.Component<FinalProps, State> {
  private prevMessageInsertedSubscription;
  private prevTypingInfoSubscription;

  constructor(props) {
    super(props);

    this.state = { loadingMessages: false, typingInfo: '' };

    this.prevMessageInsertedSubscription = null;
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.props;

    const { currentId, currentConversation, messagesQuery } = nextProps;

    // It is first time or subsequent conversation change
    if (
      !this.prevMessageInsertedSubscription ||
      currentId !== this.props.currentId
    ) {
      // Unsubscribe previous subscription ==========
      if (this.prevMessageInsertedSubscription) {
        this.prevMessageInsertedSubscription();
      }

      if (this.prevTypingInfoSubscription) {
        this.prevTypingInfoSubscription();
      }

      // Start new subscriptions =============
      this.prevMessageInsertedSubscription = messagesQuery.subscribeToMore({
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

      this.prevTypingInfoSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationClientTypingStatusChanged),
        variables: { _id: currentId },
        updateQuery: (
          prev,
          {
            subscriptionData: {
              data: { conversationClientTypingStatusChanged }
            }
          }
        ) => {
          this.setState({
            typingInfo: conversationClientTypingStatusChanged.text
          });
        }
      });
    }
  }

  addMessage = ({
    variables,
    optimisticResponse,
    callback
  }: {
    variables: any;
    optimisticResponse: any;
    callback?: (e?) => void;
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

          // clear saved messages from storage
          localStorage.removeItem(currentId || '');
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
    const conversationMessages = messagesQuery.conversationMessages || [];

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

          const prevConversationMessages = prev.conversationMessages || [];
          const prevMessageIds = prevConversationMessages.map(m => m._id);

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
              ...prevConversationMessages
            ]
          };
        }
      });
    }
  };

  render() {
    const { loadingMessages, typingInfo } = this.state;
    const { messagesQuery } = this.props;
    const conversationMessages = messagesQuery.conversationMessages || [];

    const updatedProps = {
      ...this.props,
      conversationMessages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loading: messagesQuery.loading || loadingMessages,
      typingInfo
    };

    return <DumbWorkArea {...updatedProps} />;
  }
}

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<
      Props,
      MessagesQueryResponse,
      { conversationId?: string; limit: number }
    >(gql(queries.conversationMessages), {
      name: 'messagesQuery',
      options: ({ currentId, currentConversation }) => {
        const windowHeight = window.innerHeight;
        const { integration } = currentConversation;

        // 330 - height of above and below sections of detail area
        // 45 -  min height of per message
        limit = Math.round((windowHeight - 330) / 45 + 1);
        skip = null;

        return {
          variables: {
            conversationId: currentId,
            limit: integration.kind === 'messenger' ? limit : 0
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, MessagesTotalCountQuery, { conversationId?: string }>(
      gql(queries.conversationMessagesTotalCount),
      {
        name: 'messagesTotalCountQuery',
        options: ({ currentId }) => ({
          variables: { conversationId: currentId },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, AddMessageMutationResponse, AddMessageMutationVariables>(
      gql(mutations.conversationMessageAdd),
      {
        name: 'addMessageMutation',
        options: {
          refetchQueries: ['conversationMessages']
        }
      }
    )
  )(WorkArea)
);

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WithQuery {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
