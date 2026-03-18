import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { postMessage } from '../lib/utils';
import { Header } from './messenger/components';
import { useMessenger } from './messenger/hooks/useMessenger';
import { Intro } from './messenger/components/intro';
import { useConnect } from './messenger/hooks/useConnect';
import { Skeleton, REACT_APP_API_URL } from 'erxes-ui';
import { ConversationDetails } from './messenger/components/conversation-details';
import { connectionAtom, messengerDataAtom } from './messenger/states';
import { Ticket } from './messenger/ticket/components/ticket';
import { useMessengerNotification } from './messenger/hooks/useMessengerNotification';
import { useConversations } from './messenger/hooks/useConversations';

export function App() {
  const isSmallContainer = false;
  const { activeTab } = useMessenger();
  const [connection] = useAtom(connectionAtom);
  const [messengerData, setMessengerData] = useAtom(messengerDataAtom);
  const { loading: connecting } = useConnect({
    integrationId: messengerData?.integrationId ?? '',
  });

  // Keep subscriptions alive at the app level so badge/sound fire regardless
  // of which tab is active or whether the messenger panel is visible.
  useConversations({
    setupSubscriptions: true,
    fetchPolicy: 'cache-and-network',
  });

  // Manages unread count and keeps the parent launcher badge in sync.
  // `isVisible` / `toggleMessenger` replace the previous local isMessengerVisible state.
  const { isVisible: isMessengerVisible, toggleMessenger } =
    useMessengerNotification();

  useEffect(() => {
    if (!connecting && connection.widgetsMessengerConnect?.uiOptions) {
      window.parent.postMessage(
        {
          fromErxes: true,
          message: 'connected',
          connectionInfo: connection,
          apiUrl: REACT_APP_API_URL,
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
      toggleMessenger();
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.fromPublisher) {
        if (event.data?.settings?.integrationId) {
          setMessengerData(event.data.settings);
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
  }, [isMessengerVisible, isSmallContainer, toggleMessenger, setMessengerData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ConversationDetails />;
      case 'ticket':
        return <Ticket />;
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
      <div className="flex-1 flex flex-col justify-end overflow-y-hidden bg-muted min-h-0 h-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
