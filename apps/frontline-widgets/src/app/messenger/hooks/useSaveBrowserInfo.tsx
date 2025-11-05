import { SAVE_BROWSER_INFO } from '../graphql/mutations';
import { IBrowserInfo } from '../types';
import { useMutation } from '@apollo/client';
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

  const [saveBrowserInfoMutation] = useMutation(SAVE_BROWSER_INFO, {
    onCompleted: (data) => {
      const { widgetsSaveBrowserInfo } = data || {};
      setIsBrowserInfoSaved(true);
      setLastUnreadMessage(widgetsSaveBrowserInfo);
    },
    onError: () => {
      // Error is silently handled by Apollo mutation
    },
  });

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

            setBrowserInfo(browserInfo);
            saveBrowserInfoMutation({ variables });
          },
        });
      };
      saveBrowserInfo();
    } catch (error) {
      // Error is silently handled
    }
  }, [
    connection.widgetsMessengerConnect.visitorId,
    connection.widgetsMessengerConnect.customerId,
    saveBrowserInfoMutation,
    setBrowserInfo,
  ]);
};
