import * as React from 'react';
import MessageSender from '../components/MessageSender';
import { MESSAGE_TYPES, useAppContext } from './AppContext';

type Props = {
  placeholder?: string;
  isParentFocused: boolean;
  isOnline: boolean;
  onTextInputBlur: () => void;
  collapseHead: () => void;
};

const Container = (props: Props) => {
  const {
    isAttachingFile,
    activeConversation,
    sendMessage,
    sendTypingInfo,
    sendFile,
    readMessages,
    getMessengerData,
    inputDisabled,
  } = useAppContext();

  return (
    <MessageSender
      {...props}
      inputDisabled={inputDisabled}
      isAttachingFile={isAttachingFile}
      conversationId={activeConversation}
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

export default Container;
