import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { postMessage } from '../lib/utils';
import { HeaderHero } from './messenger/components';
import { useMessenger } from './messenger/hooks/useMessenger';
import { Intro, Messages } from './messenger/components/intro';
import { useConnect } from './messenger/hooks/useConnect';
import { Skeleton, REACT_APP_API_URL, cn } from 'erxes-ui';
import { ConversationDetails } from './messenger/components/conversation-details';
import {
  connectionAtom,
  messengerDataAtom,
  unreadNotificationCountAtom,
  faqCurrentViewAtom,
  uiOptionsAtom,
} from './messenger/states';
import { useAtomValue } from 'jotai';
import { Ticket } from './messenger/ticket/components/ticket';
import { useWidgetNotifications } from './messenger/hooks/useWidgetNotifications';
import { Navigation } from './messenger/components/nav/navigation';
import { ChatInput } from './messenger/components/chat-input';
import { KnowledgeBaseView } from './messenger/components/faq/components/KnowledgeBaseView';
import { WebCall } from './messenger/components/web-call';

export function App() {
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const [isSmallContainer] = useState(false);
  const { activeTab } = useMessenger();
  const [connection] = useAtom(connectionAtom);
  const [messengerData, setMessengerData] = useAtom(messengerDataAtom);
  const uiOptions = useAtomValue(uiOptionsAtom);
  const unreadCount = useAtomValue(unreadNotificationCountAtom);
  const faqView = useAtomValue(faqCurrentViewAtom);
  // Always-on subscription: sound + web notifications work on every tab
  useWidgetNotifications();

  const { loading: connecting } = useConnect({
    integrationId: messengerData?.integrationId ?? '',
  });

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
    postMessage('fromMessenger', 'unreadCount', { count: unreadCount });
  }, [unreadCount]);

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
      if (event.data.action === 'closeMessenger' && isMessengerVisible) {
        postMessage('fromMessenger', 'messenger', { isVisible: false, isSmallContainer });
        setIsMessengerVisible(false);
        return;
      }

      if (event.data.fromPublisher) {
        if (event.data?.settings?.integrationId) {
          setMessengerData(event.data.settings);
        }

        if (event.data.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (event.data.theme === 'light') {
          document.documentElement.classList.remove('dark');
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
      case 'messages':
        return <Messages />;
      case 'ticket':
        return <Ticket />;
      case 'chat':
        return <ConversationDetails />;
      case 'faq':
        return <KnowledgeBaseView />;
      case 'web-call':
        return <WebCall />;
      default:
        return <Intro />;
    }
  };

  const isFaqArticle =
    activeTab === 'faq' && (faqView === 'article' || faqView === 'category');
  const isFaqNonArticle = activeTab === 'faq' && !isFaqArticle;

  if (connecting) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="flex flex-col h-full min-h-full">
      <div
        className={cn({
          'flex-1 overflow-y-auto hide-scroll min-h-0 flex flex-col bg-muted':
            (activeTab !== 'default' && activeTab !== 'faq') || isFaqArticle,
          'flex-1 overflow-y-auto hide-scroll min-h-0 bg-muted': activeTab === 'default',
          'flex-1  overflow-y-auto hide-scroll min-h-0 flex flex-col':
            isFaqNonArticle,
        })}
      >
        {activeTab !== 'chat' && <HeaderHero />}
        <div
          className={cn({
            'bg-muted relative z-20 px-2 pb-2 -mt-14': activeTab === 'default',
            'bg-muted relative z-20 px-2 pb-2 -mt-14 flex-1': isFaqNonArticle,

            'bg-muted relative z-20 flex-1 h-full overflow-y-hidden':
              activeTab === 'chat',

            'relative flex-1 h-full overflow-y-auto hide-scroll p-0 bg-muted':
              activeTab === 'web-call',

            'bg-muted relative z-20 px-2 pb-2 flex-1 h-full overflow-y-auto hide-scroll':
              isFaqArticle,

            // Added activeTab !== 'web-call' to the guard below:
            'bg-muted relative z-20 px-2 pb-2 flex-1 h-full overflow-y-hidden':
              activeTab !== 'default' &&
              activeTab !== 'chat' &&
              activeTab !== 'faq' &&
              activeTab !== 'web-call',
          })}
        >
          {renderContent()}
        </div>
      </div>
      {(activeTab === 'default' || activeTab === 'chat') && (
        <div className="shrink-0 px-2 bg-muted border-t border-border">
          <ChatInput />
        </div>
      )}
      {activeTab !== 'chat' && activeTab !== 'web-call' && (
        <Navigation value={uiOptions?.navigationVariant}>
          <Navigation.Bar />
        </Navigation>
      )}
    </div>
  );
}

export default App;
