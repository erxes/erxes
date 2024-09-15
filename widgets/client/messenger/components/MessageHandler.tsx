import * as React from 'react';
import { useEffect, useCallback } from 'react';
import { useConversation } from '../context/Conversation';

const MessageHandler = ({ children }: { children: React.ReactNode }) => {
  const { toggle } = useConversation();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const { data } = event;

      if (data?.fromPublisher && data.action === 'toggleMessenger') {
        // Receive show messenger command from publisher
        toggle();
      }
    },
    [toggle]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return <>{children}</>;
};

export default MessageHandler;
