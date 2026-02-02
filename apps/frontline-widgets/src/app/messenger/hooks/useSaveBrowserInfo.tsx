import { IBrowserInfo } from '../types';
import React from 'react';
import { requestBrowserInfo } from '@libs/utils';
import { useAtom, useSetAtom } from 'jotai';
import { browserInfoAtom, connectionAtom } from '../states';

export const useSaveBrowserInfo = () => {
  const [connection] = useAtom(connectionAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);

  React.useEffect(() => {
    try {
      const saveBrowserInfo = () => {
        requestBrowserInfo({
          source: 'fromMessenger',
          callback: (browserInfo: IBrowserInfo) => {
            connection.browserInfo = browserInfo;

            setBrowserInfo(browserInfo);
          },
        });
      };
      saveBrowserInfo();
    } catch (error) {
      console.error('Error saving browser info', error);
      // Error is silently handled
    }
  }, [
    connection.widgetsMessengerConnect.visitorId,
    connection.widgetsMessengerConnect.customerId,
    setBrowserInfo,
    connection,
  ]);
};
