import { IBrowserInfo } from '../types';
import React from 'react';
import { requestBrowserInfo } from '@libs/utils';
import { useAtom, useSetAtom } from 'jotai';
import { browserInfoAtom, connectionAtom } from '../states';
import { useMutation } from '@apollo/client';
import { SAVE_BROWSER_INFO } from '../graphql';

export const useSaveBrowserInfo = () => {
  const [connection, setConnection] = useAtom(connectionAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);
  const [mutate, { loading }] = useMutation(SAVE_BROWSER_INFO);

  React.useEffect(() => {
    try {
      const saveBrowserInfo = () => {
        requestBrowserInfo({
          source: 'fromMessenger',
          callback: (browserInfo: IBrowserInfo) => {
            setConnection((prev) => ({
              ...prev,
              browserInfo,
            }));

            setBrowserInfo(browserInfo);

            mutate({
              variables: {
                customerId: connection.widgetsMessengerConnect.customerId,
                visitorId: connection.widgetsMessengerConnect.visitorId,
                browserInfo,
              }
            }).catch((error) => {
              console.error('Error saving browser info mutation', error);
            });
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
    setConnection,
    mutate,
  ]);
};
