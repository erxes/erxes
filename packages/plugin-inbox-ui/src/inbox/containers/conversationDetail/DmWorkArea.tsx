import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
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
  DmConfig,
  IConversation,
  IMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from '@erxes/ui-inbox/src/inbox/types';
import { isConversationMailKind } from '@erxes/ui-inbox/src/inbox/utils';

// messages limit
let initialLimit = 10;

type Props = {
  currentConversation: IConversation;
  currentId?: string;
  refetchDetail: () => void;
  dmConfig?: DmConfig;
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

const getQueryString = (
  type: 'messagesQuery' | 'countQuery',
  dmConfig?: DmConfig
): string => {
  const defaultQuery =
    type === 'messagesQuery'
      ? 'conversationMessages'
      : 'conversationMessagesTotalCount';

  return dmConfig ? dmConfig[type].query : defaultQuery;
};

const getListQueryName = (dmConfig?: DmConfig) => {
  return dmConfig ? dmConfig.messagesQuery.name : 'conversationMessages';
};

const getQueryResult = (queryResponse: object, countQuery?: boolean) => {
  let key = countQuery
    ? 'conversationMessagesTotalCount'
    : 'conversationMessages';

  for (const k of Object.keys(queryResponse)) {
    if (k.includes('ConversationMessages')) {
      key = k;
      break;
    }
  }

  return queryResponse[key] || [];
};

const getQueryResultKey = (queryResponse: object, countQuery?: boolean) => {
  let key = countQuery
    ? 'conversationMessagesTotalCount'
    : 'conversationMessages';

  for (const k of Object.keys(queryResponse)) {
    if (k.includes('ConversationMessages')) {
      key = k;
      break;
    }
  }

  return key;
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
    const {
      currentId,
      currentConversation,
      messagesQuery,
      dmConfig
    } = nextProps;

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
          let message = subscriptionData.data.conversationMessageInserted;
          const kind = currentConversation.integration.kind;

          if (!prev) {
            return;
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

          const messages = getQueryResult(prev);

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
            [getListQueryName(dmConfig)]: [...messages, message]
          };

          // send desktop notification
          sendDesktopNotification({
            title: NOTIFICATION_TYPE[kind] || `You have a new ${kind} message`,
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
      update = (cache, { data: { conversationMessageAdd } }) => {
        const message = conversationMessageAdd;

        let messagesQuery = queries.conversationMessages;

        if (dmConfig) {
          messagesQuery = getQueryString('messagesQuery', dmConfig);
        }

        // trying to read query by initial variables. Because currenty it is apollo bug.
        // https://github.com/apollographql/apollo-client/issues/2499
        const selector = {
          query: gql(messagesQuery),
          variables: {
            conversationId: currentId,
            limit: initialLimit,
            skip: 0
          }
        };

        cache.updateQuery(selector, data => {
          const key = getQueryResultKey(data);
          const messages = data[key] || [];

          // check duplications
          if (messages.find(m => m._id === message._id)) {
            return;
          }

          return { [key]: [...messages, message] };
        });
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

    const conversationMessagesTotalCount = getQueryResult(
      messagesTotalCountQuery,
      true
    );

    const conversationMessages = getQueryResult(messagesQuery);

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

          const prevConversationMessages = getQueryResult(prev);
          const prevMessageIds = prevConversationMessages.map(m => m._id);

          const fetchedMessages: IMessage[] = [];

          const more = getQueryResult(fetchMoreResult);

          for (const message of more) {
            if (!prevMessageIds.includes(message._id)) {
              fetchedMessages.push(message);
            }
          }

          return {
            ...prev,
            [getListQueryName(dmConfig)]: [
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

    const conversationMessages = getQueryResult(messagesQuery);

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

const generateWithQuery = (props: Props) => {
  const { dmConfig, currentConversation } = props;
  const { integration } = currentConversation;

  let listQuery = queries.conversationMessages;
  let countQuery = queries.conversationMessagesTotalCount;

  if (dmConfig) {
    listQuery = getQueryString('messagesQuery', dmConfig);
    countQuery = getQueryString('countQuery', dmConfig);
  }

  return withProps<Props & { currentUser: IUser }>(
    compose(
      graphql<
        Props,
        MessagesQueryResponse,
        { conversationId?: string; limit: number }
      >(gql(listQuery), {
        name: 'messagesQuery',
        options: ({ currentId }) => {
          const windowHeight = window.innerHeight;
          const isMail = isConversationMailKind(currentConversation);
          const isDm = integration.kind === 'messenger' || dmConfig;

          // 330 - height of above and below sections of detail area
          // 45 -  min height of per message
          initialLimit = !isMail
            ? Math.round((windowHeight - 330) / 45 + 1)
            : 10;

          return {
            variables: {
              conversationId: currentId,
              limit: isDm || isMail ? initialLimit : 0,
              skip: 0
            },
            fetchPolicy: 'network-only'
          };
        }
      }),
      graphql<Props, MessagesTotalCountQuery, { conversationId?: string }>(
        gql(countQuery),
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

let WithQuery;

export const resetDmWithQueryCache = () => {
  WithQuery = null;
};

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        if (!WithQuery) {
          WithQuery = generateWithQuery(props);
        }

        return <WithQuery {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
