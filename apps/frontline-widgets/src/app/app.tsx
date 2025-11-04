import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { postMessage } from '../lib/utils';
import { Header } from './messenger/components';
import { useMessenger } from './messenger/hooks/useMessenger';
import { Intro } from './messenger/components/intro';
import { useConnect } from './messenger/hooks/useConnect';
import { Skeleton } from 'erxes-ui';
import { ConversationDetails } from './messenger/components/conversation-details';
import { connectionAtom } from './messenger/states';

export function App() {
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const [isSmallContainer] = useState(false);
  const { activeTab } = useMessenger();
  const [connection] = useAtom(connectionAtom);
  const [integrationId, setIntegrationId] = useState('');
  const { loading: connecting } = useConnect({
    integrationId,
  });

  useEffect(() => {
    if (!connecting && connection.widgetsMessengerConnect?.uiOptions) {
      window.parent.postMessage(
        {
          fromErxes: true,
          message: 'connected',
          connectionInfo: connection,
          apiUrl: process.env.REACT_APP_API_URL,
        },
        '*',
      );
    }
  }, [connecting, connection]);

  useEffect(() => {
    const toggle = () => {
      // notify parent window launcher state
      postMessage('fromMessenger', 'messenger', {
        isVisible: !isMessengerVisible,
        isSmallContainer,
      });
      setIsMessengerVisible(!isMessengerVisible);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.fromPublisher) {
        if (event.data?.settings?.integrationId) {
          setIntegrationId(event.data.settings.integrationId);
        }

        if (event.data.action === 'toggleMessenger') {
          toggle();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isMessengerVisible, isSmallContainer]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ConversationDetails />;
      default:
        return <Intro />;
    }
  };

  if (connecting) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="flex flex-col h-full min-h-full styled-scroll hide-scroll">
      <Header />
      <div className="flex-1 flex flex-col justify-end overflow-y-hidden bg-muted min-h-0">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
