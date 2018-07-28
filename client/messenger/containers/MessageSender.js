import * as React from 'react';
import { AppConsumer } from './AppContext';
import { MessageSender } from '../components';

const container = (props) => {
  return (
    <AppConsumer>
      {({ isAttachingFile, activeConversation, sendMessage, sendFile, readMessages }) => {
        return (
          <MessageSender
            {...props}
            isAttachingFile={isAttachingFile}
            conversationId={activeConversation}

            sendMessage={(message) => {
              if (!message.trim()) {
                return;
              }

              sendMessage(message);
            }}

            readMessages={(conversationId) => {
              if (conversationId) {
                readMessages(conversationId);
              }
            }}

            sendFile={sendFile}
          />
        )
      }}
    </AppConsumer>
  );
}

export default container;
