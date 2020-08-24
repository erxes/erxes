import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import DumbWorkArea from 'modules/inbox/components/conversationDetail/workarea/WorkArea';
import { NOTIFICATION_TYPE } from 'modules/inbox/constants';
import { mutations, queries, subscriptions } from 'modules/inbox/graphql';
import { isConversationMailKind } from 'modules/inbox/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import strip from 'strip';
import { IUser } from '../../../auth/types';
import { sendDesktopNotification, withProps } from '../../../common/utils';
import {
  AddMessageMutationResponse,
  AddMessageMutationVariables,
  IConversation,
  IMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from '../../types';

// messages limit
let initialLimit = 10;

type Props = {
  currentConversation: IConversation;
  currentId?: string;
  refetchDetail: () => void;
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
        this.setState({ typingInfo: '' });
        this.prevTypingInfoSubscription();
      }

      // Start new subscriptions =============
      this.prevMessageInsertedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          const message = subscriptionData.data.conversationMessageInserted;
          const kind = currentConversation.integration.kind;

          if (!prev) {
            return;
          }

          // Whenever mail thread receives a new message refetch for optimistic ui
          if (kind === 'gmail' || kind.includes('nylas')) {
            return messagesQuery.refetch();
          }

          // current user's message is being showed after insert message
          // mutation. So to prevent from duplication we are ignoring current
          // user's messages from subscription
          const isMessenger = kind === 'messenger';

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

          // send desktop notification
          sendDesktopNotification({
            title: NOTIFICATION_TYPE[kind],
            content: strip(message.content) || ''
          });

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

    // immediate ui update =======
    let update;

    if (optimisticResponse) {
      update = (proxy, { data: { conversationMessageAdd } }) => {
        const message = conversationMessageAdd;

        // trying to read query by initial variables. Because currenty it is apollo bug.
        // https://github.com/apollographql/apollo-client/issues/2499
        const selector = {
          query: gql(queries.conversationMessages),
          variables: {
            conversationId: currentId,
            limit: initialLimit,
            skip: 0
          }
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

      messagesQuery.fetchMore({
        variables: {
          conversationId: currentId,
          limit: 10,
          skip: conversationMessages.length
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
      refetchMessages: messagesQuery.refetch,
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
        const isMail = isConversationMailKind(currentConversation);

        // 330 - height of above and below sections of detail area
        // 45 -  min height of per message
        initialLimit = !isMail ? Math.round((windowHeight - 330) / 45 + 1) : 10;

        return {
          variables: {
            conversationId: currentId,
            limit:
              integration.kind === 'messenger' || isMail ? initialLimit : 0,
            skip: 0
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
        name: 'addMessageMutation'
      }
    )
  )(WorkArea)
);

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        return <WithQuery {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
