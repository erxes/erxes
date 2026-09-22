import { IBrowserInfo } from '../types';
import React from 'react';
import { requestBrowserInfo } from '@libs/utils';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { browserInfoAtom, connectionAtom } from '../states';
import { useMutation } from '@apollo/client';
import { SAVE_BROWSER_INFO } from '../graphql';

export const useSaveBrowserInfo = () => {
  const [connection, setConnection] = useAtom(connectionAtom);
  const browserInfo = useAtomValue(browserInfoAtom);
  const setBrowserInfo = useSetAtom(browserInfoAtom);
  const [mutate, { loading }] = useMutation(SAVE_BROWSER_INFO);

  const customerId = connection.widgetsMessengerConnect.customerId;
  const visitorId = connection.widgetsMessengerConnect.visitorId;

  const saveBrowserInfo = React.useCallback(
    (info: IBrowserInfo) => {
      setConnection((prev) => ({
        ...prev,
        browserInfo: info,
      }));

      setBrowserInfo(info);

      mutate({
        variables: {
          customerId,
          visitorId,
          browserInfo: info,
        },
      }).catch((error) => {
        console.error('Error saving browser info mutation', error);
      });
    },
    [customerId, visitorId, mutate, setBrowserInfo, setConnection],
  );

  React.useEffect(() => {
    try {
      requestBrowserInfo({
        source: 'fromMessenger',
        callback: saveBrowserInfo,
      });
    } catch (error) {
      console.error('Error saving browser info', error);
      // Error is silently handled
    }
  }, [visitorId, customerId, saveBrowserInfo]);

  // SPA support: the host page's loader script (index.ts) tracks client-side
  // route changes (History API navigation that never reloads the page) and
  // notifies us here, so we can re-save browser info with the new URL for
  // accurate page-view tracking — reusing the already-fetched geo info
  // instead of re-requesting it.
  React.useEffect(() => {
    if (!customerId && !visitorId) return;

    const handleLocationChange = (event: MessageEvent) => {
      const { fromPublisher, action, url } = event.data || {};
      if (!fromPublisher || action !== 'locationChange' || !url) return;
      if (!browserInfo) return;

      saveBrowserInfo({ ...browserInfo, url });
    };

    window.addEventListener('message', handleLocationChange);
    return () => window.removeEventListener('message', handleLocationChange);
  }, [customerId, visitorId, browserInfo, saveBrowserInfo]);
};
