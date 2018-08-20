import * as React from "react";
import { MessageSender } from "../components";
import { AppConsumer } from "./AppContext";

type Props = {
  placeholder?: string;
  isParentFocused: boolean;
  onTextInputBlur: () => void;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({
        isAttachingFile,
        activeConversation,
        sendMessage,
        sendFile,
        readMessages
      }) => {
        return (
          <MessageSender
            {...props}
            isAttachingFile={isAttachingFile}
            conversationId={activeConversation}
            sendMessage={message => {
              if (!message.trim()) {
                return;
              }

              sendMessage(message);
            }}
            readMessages={conversationId => {
              if (conversationId) {
                readMessages(conversationId);
              }
            }}
            sendFile={sendFile}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
