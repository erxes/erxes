import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import strip from 'strip';

import { AppConsumer } from 'coreui/appContext';
import DmWorkArea from '../../components/conversationDetail/workarea/DmWorkArea';
import { NOTIFICATION_TYPE } from '../../constants';
import {
  mutations,
  queries,
  subscriptions
} from '@erxes/ui-inbox/src/inbox/graphql';
import { IUser } from '@erxes/ui/src/auth/types';
import { sendDesktopNotification, withProps } from '@erxes/ui/src/utils';
import {
  AddMessageMutationResponse,
  AddMessageMutationVariables,
  IConversation,
  IMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from '@erxes/ui-inbox/src/inbox/types';

// messages limit
const initialLimit = 10;

type Props = {
  currentConversation: IConversation;
  currentId?: string;
  refetchDetail: () => void;
  dmConfig?: any;
};

type FinalProps = {
  currentUser: IUser;
  messagesQuery: any;
  messagesTotalCountQuery: any;
} & Props &
  AddMessageMutationResponse;

type State = {
  loadingMessages: boolean;
  typingInfo?: string;
};

const getMessagesQueryValue = (messagesQuery, queryName: string) => {
  let key = queryName || 'conversationMessages';

  for (const k of Object.keys(messagesQuery)) {
    if (k.includes('ConversationMessages')) {
      key = k;
      break;
    }
  }

  return messagesQuery[key] || [];
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
    const { currentUser, dmConfig } = this.props;
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

          const messages =
            prev[dmConfig.messagesQueryName] || prev.conversationMessages;

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
            conversationMessages: [...messages, message],
            [dmConfig.messagesQueryName]: [...messages, message]
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
          _prev,
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
    const { addMessageMutation, currentId, dmConfig } = this.props;

    // immediate ui update =======
    let update;

    if (optimisticResponse) {
      update = (proxy, { data: { conversationMessageAdd } }) => {
        const message = conversationMessageAdd;

        const query = dmConfig.messagesQuery || queries.conversationMessages;
        // trying to read query by initial variables. Because currenty it is apollo bug.
        // https://github.com/apollographql/apollo-client/issues/2499
        const selector = {
          query: gql(query),
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

        const messages =
          data[dmConfig.messagesQueryName] || data.conversationMessages;

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
    const {
      currentId,
      messagesTotalCountQuery,
      messagesQuery,
      dmConfig
    } = this.props;
    const { conversationMessagesTotalCount } = messagesTotalCountQuery;
    const conversationMessages =
      messagesQuery[dmConfig.messagesQueryName] ||
      messagesQuery.conversationMessages ||
      [];

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

          const result = { ...prev };
          const prevConversationMessages =
            prev[dmConfig.messagesQueryName] || prev.conversationMessages || [];
          const prevMessageIds = prevConversationMessages.map(m => m._id);

          const fetchedMessages: IMessage[] = [];
          const more =
            fetchMoreResult[dmConfig.messagesQueryName] ||
            fetchMoreResult.conversationMessages;

          for (const message of more) {
            if (!prevMessageIds.includes(message._id)) {
              fetchedMessages.push(message);
            }
          }

          result[dmConfig.messagesQueryName] = [
            ...fetchedMessages,
            ...prevConversationMessages
          ];

          return result;
        }
      });
    }
  };

  render() {
    const { loadingMessages, typingInfo } = this.state;
    const { messagesQuery, dmConfig } = this.props;

    const conversationMessages = getMessagesQueryValue(
      messagesQuery,
      dmConfig && dmConfig.messagesQueryName
    );

    const updatedProps = {
      ...this.props,
      conversationMessages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loading: messagesQuery.loading || loadingMessages,
      refetchMessages: messagesQuery.refetch,
      typingInfo
    };

    return <DmWorkArea {...updatedProps} />;
  }
}

const generateWithQuery = props => {
  const { dmConfig = {} } = props;

  return withProps<Props & { currentUser: IUser }>(
    compose(
      graphql<
        Props,
        MessagesQueryResponse,
        { conversationId?: string; limit: number }
      >(gql(dmConfig.messagesQuery || queries.conversationMessages), {
        name: 'messagesQuery',
        options: ({ currentId }) => {
          return {
            variables: {
              conversationId: currentId,
              limit: initialLimit,
              skip: 0
            },
            fetchPolicy: 'network-only'
          };
        }
      }),
      graphql<Props, MessagesTotalCountQuery, { conversationId?: string }>(
        gql(dmConfig.countQuery || queries.conversationMessagesTotalCount),
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
};

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        const WithQuery = generateWithQuery(props);

        return <WithQuery {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
