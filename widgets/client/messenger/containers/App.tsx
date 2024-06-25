import '@nateradebaugh/react-datetime/css/react-datetime.css';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import DumbApp from '../components/App';
import { AppProvider, useAppContext } from './AppContext';
import '../sass/style.min.css';

import * as dayjs from 'dayjs';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const AppWrapper: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent: React.FC = () => {
  const { isMessengerVisible, saveBrowserInfo, getMessengerData, toggle } =
    useAppContext();

  const { showLauncher } = getMessengerData();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const { data } = event;
      if (data?.fromPublisher) {
        // Receive show messenger command from publisher
        if (data.action === 'showMessenger') {
          toggle(false);
        }
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

  return (
    <DumbApp
      isMessengerVisible={isMessengerVisible}
      saveBrowserInfo={saveBrowserInfo}
      showLauncher={showLauncher}
    />
  );
};

export default AppWrapper;
