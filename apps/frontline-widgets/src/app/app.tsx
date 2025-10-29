import { useEffect, useState } from 'react';
import { postMessage } from '../lib/utils';

export function App() {
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const [isSmallContainer] = useState(false);

  useEffect(() => {
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

  return <div>Hello</div>;
}

export default App;
