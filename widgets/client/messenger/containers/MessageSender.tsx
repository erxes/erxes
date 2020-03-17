import * as React from 'react';
import { MessageSender } from '../components';
import { AppConsumer, MESSAGE_TYPES } from './AppContext';

type Props = {
  placeholder?: string;
  isParentFocused: boolean;
  onTextInputBlur: () => void;
  collapseHead: () => void;
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
        getUiOptions
      }) => {
        return (
          <MessageSender
            {...props}
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
            videoCallUsageStatus={getUiOptions().videoCallUsageStatus}
          />
        );
      }}
    </AppConsumer>
  );
};

export default Container;
