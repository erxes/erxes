import * as React from "react";
import { MessageSender } from "../components";
import { AppConsumer, MESSAGE_TYPES } from "./AppContext";

type Props = {
  placeholder?: string;
  isParentFocused: boolean;
  isOnline: boolean;
  operatorStatus?: string;
  onTextInputBlur: () => void;
  collapseHead: () => void;
  refetchConversationDetail?: () => void;
};

const Container = (props: Props) => {
  return (
    <AppConsumer>
      {({
        isAttachingFile,
        activeConversation,
        sendMessage,
        sendTypingInfo,
        sendFile,
        readMessages,
        changeOperatorStatus,
        getMessengerData,
      }) => {
        return (
          <MessageSender
            {...props}
            isAttachingFile={isAttachingFile}
            conversationId={activeConversation}
            sendTypingInfo={sendTypingInfo}
            changeOperatorStatus={(conversationId, operatorStatus) => {
              return changeOperatorStatus(conversationId, operatorStatus, () => {
                if (props.refetchConversationDetail) {
                  return props.refetchConversationDetail();
                }
              });
            }}
            sendMessage={(contentType, message) => {
              if (contentType === MESSAGE_TYPES.TEXT && !message.trim()) {
                return;
              }

              sendMessage(contentType, message);
            }}
            readMessages={readMessages}
            sendFile={sendFile}
            showVideoCallRequest={
              props.isOnline && getMessengerData().showVideoCallRequest
            }
          />
        );
      }}
    </AppConsumer>
  );
};

export default Container;
