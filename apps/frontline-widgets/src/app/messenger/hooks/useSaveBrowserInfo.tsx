import { SAVE_BROWSER_INFO } from '../graphql/mutations';
import { IBrowserInfo } from '../types';
import { apolloClient } from '@libs/apollo-client';
import React from 'react';
import { requestBrowserInfo } from '@libs/utils';
import { useAtom, useSetAtom } from 'jotai';
import {
  browserInfoAtom,
  isBrowserInfoSavedAtom,
  lastUnreadMessageAtom,
  connectionAtom,
} from '../states';

export const useSaveBrowserInfo = () => {
  const [connection] = useAtom(connectionAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);
  const setIsBrowserInfoSaved = useSetAtom(isBrowserInfoSavedAtom);
  const setLastUnreadMessage = useSetAtom(lastUnreadMessageAtom);

  React.useEffect(() => {
    try {
      const saveBrowserInfo = () => {
        requestBrowserInfo({
          source: 'fromMessenger',
          callback: (browserInfo: IBrowserInfo) => {
            connection.browserInfo = browserInfo;

            const variables = {
              visitorId:
                connection.widgetsMessengerConnect.visitorId || undefined,
              customerId:
                connection.widgetsMessengerConnect.customerId || undefined,
              browserInfo,
            };

            apolloClient
              .mutate({
                mutation: SAVE_BROWSER_INFO,
                variables,
              })
              .then((data) => {
                const { widgetsSaveBrowserInfo } = data?.data || {};

                setIsBrowserInfoSaved(true);
                setLastUnreadMessage(widgetsSaveBrowserInfo);
                setBrowserInfo(browserInfo);
              })
              .catch((error) => {
                console.error('Error saving browser info:', error);
              });
          },
        });
      };
      saveBrowserInfo();
    } catch (error) {
      console.error('useSaveBrowserInfo: Error in effect:', error);
    }
  }, [
    connection.widgetsMessengerConnect.visitorId,
    connection.widgetsMessengerConnect.customerId,
  ]);
};
