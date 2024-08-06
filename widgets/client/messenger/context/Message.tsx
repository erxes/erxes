import * as React from 'react';
import { useState, createContext, useContext } from 'react';
import { connection } from '../connection';
import { IAttachment } from '../types';
import { setLocalStorageItem } from '../../common';
import { MESSAGE_TYPES } from '../constants';
import { newLineToBr } from '../../utils';
import {
  WIDGETS_INSERT_MESSAGE_MUTATION,
  WIDGET_BOT_REQUEST_MUTATION,
} from '../graphql/mutations';
import { useConversation } from './Conversation';
import { useConfig } from './Config';
import { useMutation } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

interface MessageContextType {
  sendMessage: (
    contentType: string,
    message: string,
    attachments?: IAttachment[]
  ) => void;
  isSendingMessage: boolean;
  errorMessage: string;
  replyAutoAnswer: (message: string, payload: string, type: string) => void;
}

const MessageContext = createContext<MessageContextType>(
  {} as MessageContextType
);

export const MessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeConversationId, setActiveConversationId, changeConversation } =
    useConversation();
  const { selectedSkill } = useConfig();

  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [insertMessage] = useMutation(
    WIDGETS_INSERT_MESSAGE_MUTATION(connection)
  );
  const [mutateBotRequest] = useMutation(WIDGET_BOT_REQUEST_MUTATION);

  if (process.env.NODE_ENV !== 'production') {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
  }

  const sendMessage = (
    contentType: string,
    message: string,
    attachments?: IAttachment[]
  ) => {
    // current conversation
    const array = new Uint32Array(1);

    const optimisticResponse = {
      __typename: 'Mutation',
      widgetsInsertMessage: {
        __typename: 'ConversationMessage',
        _id: crypto.getRandomValues(array).join(' '),
        contentType: MESSAGE_TYPES.TEXT,
        conversationId: activeConversationId,
        customerId: connection.data.customerId,
        user: null,
        content: newLineToBr(message),
        createdAt: Number(new Date()),
        attachments: attachments || [],
        internal: false,
        botData: null,
        fromBot: false,
        messengerAppData: null,
        videoCallData: null,
        engageData: null,
      },
    };

    // Preventing from creating new conversations
    if (!activeConversationId && isSendingMessage) {
      return 'Already sending';
    }

    setIsSendingMessage(true);
    setErrorMessage('');

    return insertMessage({
      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        conversationId: activeConversationId,
        skillId: selectedSkill,
        contentType,
        message: newLineToBr(message),
        attachments,
      },
      optimisticResponse,
      // update(cache, { data: { widgetsInsertMessage } }) {
      //   if (!activeConversationId) return;

      //   const selector = {
      //     query: GET_CONVERSATION_DETAIL(connection.enabledServices.dailyco),
      //     variables: {
      //       _id: widgetsInsertMessage.conversationId,
      //       integrationId: connection.data.integrationId,
      //     },
      //   };

      //   // Read data from our cache for this query
      //   const cacheData: any = cache.readQuery(selector);

      //   const messages = cacheData?.widgetsConversationDetail?.messages || [];

      //   // check duplications
      //   if (
      //     !messages.find((m: IMessage) => m._id === widgetsInsertMessage._id)
      //   ) {
      //     // Add our message from the mutation to the end
      //     messages.push(widgetsInsertMessage);

      //     // Write out data back to the cache
      //     cache.writeQuery({ ...selector, data: cacheData });
      //   }
      // },
      onCompleted(data) {
        setIsSendingMessage(false);

        const { widgetsInsertMessage } = data;

        if (!activeConversationId) {
          changeConversation(widgetsInsertMessage.conversationId);
        }

        if (!connection.data.customerId) {
          connection.data.customerId = widgetsInsertMessage.customerId;
          connection.data.visitorId = null;
          setLocalStorageItem('customerId', widgetsInsertMessage.customerId);
        }
      },
      onError(error) {
        setIsSendingMessage(false);
        setErrorMessage(
          error && error.message
            ? error.message.replace('GraphQL error: ', '')
            : ''
        );
      },
    });
  };

  const replyAutoAnswer = async (
    message: string,
    payload: string,
    type: string
  ) => {
    setIsSendingMessage(true);

    return mutateBotRequest({
      variables: {
        conversationId: activeConversationId,
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        message: newLineToBr(message),
        type,
        payload,
      },
      onCompleted(data) {
        if (!data) {
          setIsSendingMessage(false);

          return;
        }

        const { conversationId, customerId } = data.widgetBotRequest;

        setLocalStorageItem('customerId', customerId);
        connection.data.customerId = customerId;

        setIsSendingMessage(false);
        setActiveConversationId(conversationId);
      },
      onError() {
        setIsSendingMessage(false);
      },
    });
  };

  return (
    <MessageContext.Provider
      value={{
        sendMessage,
        isSendingMessage,
        errorMessage,
        replyAutoAnswer,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);
