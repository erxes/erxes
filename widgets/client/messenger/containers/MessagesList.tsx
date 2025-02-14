import * as React from "react";

import { getColor, getMessengerData, getUiOptions } from "../utils/util";

import { IMessage } from "../types";
import MessagesList from "../components/MessagesList";
import { useConfig } from "../context/Config";
import { useConversation } from "../context/Conversation";
import { useMessage } from "../context/Message";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
  toggleVideoCall: () => void;
  refetchConversationDetail?: () => void;
  operatorStatus?: string;
  errorMessage: string;
  isLoading: boolean;
};

export default (props: Props) => {
  const {
    isBotTyping,
    activeConversationId,
    saveGetNotified,
    getBotInitialMessage,
    sendTypingInfo,
  } = useConversation();

  const { selectedSkill, onSelectSkill, isLoggedIn, changeOperatorStatus } =
    useConfig();

  const { replyAutoAnswer, sendMessage } = useMessage();

  return (
    <MessagesList
      {...props}
      botTyping={isBotTyping}
      selectedSkill={selectedSkill}
      conversationId={activeConversationId}
      uiOptions={getUiOptions()}
      messengerData={getMessengerData()}
      saveGetNotified={saveGetNotified}
      getBotInitialMessage={getBotInitialMessage}
      onSelectSkill={onSelectSkill}
      getColor={getColor()}
      isLoggedIn={isLoggedIn}
      sendTypingInfo={sendTypingInfo}
      changeOperatorStatus={(conversationId, operatorStatus) => {
        return changeOperatorStatus(conversationId, operatorStatus, () => {
          if (props.refetchConversationDetail) {
            return props.refetchConversationDetail();
          }
        });
      }}
      replyAutoAnswer={replyAutoAnswer}
      sendMessage={sendMessage}
      showVideoCallRequest={
        props.isOnline && getMessengerData().showVideoCallRequest
      }
    />
  );
};
