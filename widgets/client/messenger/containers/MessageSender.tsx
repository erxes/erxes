import * as React from "react";

import { MESSAGE_TYPES } from "../constants";
import MessageSender from "../components/MessageSender";
import { getMessengerData } from "../utils/util";
import { useConfig } from "../context/Config";
import { useConversation } from "../context/Conversation";
import useHelpers from "../hooks/useHelpers";
import { useMessage } from "../context/Message";

type Props = {
  placeholder?: string;
  isParentFocused: boolean;
  isOnline: boolean;
  onTextInputBlur: () => void;
  collapseHead: () => void;
};

const MessageSenderContainer = (props: Props) => {
  const { isAttachingFile, isInputDisabled } = useConfig();
  const { activeConversationId, sendTypingInfo, readMessages } =
    useConversation();
  const { sendMessage } = useMessage();
  const { sendFile } = useHelpers();

  return (
    <MessageSender
      {...props}
      inputDisabled={isInputDisabled}
      isAttachingFile={isAttachingFile}
      conversationId={activeConversationId}
      sendTypingInfo={sendTypingInfo}
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
};

export default MessageSenderContainer;
