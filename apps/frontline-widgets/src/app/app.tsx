import { useEffect, useState } from 'react';
import { postMessage } from '../lib/utils';
import { Header } from './messenger/components';
import { useMessenger } from './messenger/hooks/useMessenger';
import { Intro } from './messenger/components/intro';
import { useConnect } from './messenger/hooks/useConnect';
import { Skeleton } from 'erxes-ui';

export function App() {
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const [isSmallContainer] = useState(false);
  const { activeTab } = useMessenger();

  const { loading: connecting } = useConnect({
    channelId: 'JCwNcKRss4W94g8F5FKpw',
  });

  useEffect(() => {
    console.log('App component mounted');
    setTimeout(() => {
      window.parent.postMessage(
        {
          fromErxes: true,
          message: 'connected',
          connectionInfo: {
            widgetsMessengerConnect: {
              uiOptions: {
                color: 'red',
              },
            },
          },
        },
        '*',
      );
    }, 1000);

    return () => {
      window.removeEventListener('message', () => null);
    };
  }, []);

  useEffect(() => {
    const toggle = () => {
      // notify parent window launcher state
      postMessage('fromMessenger', 'messenger', {
        isVisible: !isMessengerVisible,
        isSmallContainer,
      });
      setIsMessengerVisible(!isMessengerVisible);
    };

    window.addEventListener('message', (event) => {
      if (event.data.fromPublisher) {
        if (event.data.action === 'toggleMessenger') {
          toggle();
        }
      }
    });

    return () => {
      window.removeEventListener('message', () => null);
    };
  }, [isMessengerVisible, isSmallContainer]);

  const renderContent = () => {
    switch (activeTab) {
      default:
        return <Intro />;
    }
  };

  if (connecting) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="h-full">
      <Header />
      <div className="flex-1 flex flex-col justify-end overflow-y-hidden h-full bg-muted">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
