import * as React from 'react';
import { MessagesList } from '../components';
import { IMessage } from '../types';
import { AppConsumer } from './AppContext';

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
  toggleVideoCall: () => void;
  refetchConversationDetail?: () => void;
  operatorStatus?: string;
};

export default (props: Props) => {
  return (
    <AppConsumer>
      {({
        getUiOptions,
        getMessengerData,
        saveGetNotified,
        getColor,
        isLoggedIn,
        sendMessage,
        sendTypingInfo,
        replyAutoAnswer,
        changeOperatorStatus,
        botTyping,
        activeConversation
      }) => {
        return (
          <MessagesList
            {...props}
            botTyping={botTyping}
            conversationId={activeConversation}
            uiOptions={getUiOptions()}
            messengerData={getMessengerData()}
            saveGetNotified={saveGetNotified}
            getColor={getColor()}
            isLoggedIn={isLoggedIn}
            sendTypingInfo={sendTypingInfo}
            changeOperatorStatus={(conversationId, operatorStatus) => {
              return changeOperatorStatus(
                conversationId,
                operatorStatus,
                () => {
                  if (props.refetchConversationDetail) {
                    return props.refetchConversationDetail();
                  }
                }
              );
            }}
            replyAutoAnswer={replyAutoAnswer}
            sendMessage={sendMessage}
            showVideoCallRequest={
              props.isOnline && getMessengerData().showVideoCallRequest
            }
          />
        );
      }}
    </AppConsumer>
  );
};
