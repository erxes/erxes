import { useState, useEffect } from 'react';
import { apolloClient } from '@libs/apollo-client';
import { useSetAtom } from 'jotai';
import { connectionAtom, integrationIdAtom, uiOptionsAtom } from '../states';
import { IConnectionInfo, IWidgetUiOptions } from '../types/connection';
import { getLocalStorageItem, getErxesSettings } from '@libs/utils';
import { applyUiOptionsToTailwind } from '@libs/tw-utils';
import { useSaveBrowserInfo } from './useSaveBrowserInfo';
import { connect } from '../graphql';

interface connectionProps {
  isCloudFlareEnabled?: boolean;
  isTicketEnabled?: boolean;
  channelId: string;
}

export const useConnect = ({
  isCloudFlareEnabled = false,
  isTicketEnabled = false,
  channelId,
}: connectionProps) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setConnection = useSetAtom(connectionAtom);
  const setIntegrationId = useSetAtom(integrationIdAtom);
  const setUiOptions = useSetAtom(uiOptionsAtom);
  const cachedCustomerId = getLocalStorageItem('customerId');

  // Call useSaveBrowserInfo hook
  useSaveBrowserInfo();

  useEffect(() => {
    const executeConnection = async () => {
      try {
        setLoading(true);
        setError(null);

        let visitorId;

        // if (!cachedCustomerId) {
        const { getVisitorId } = await import('@libs/utils');

        visitorId = await getVisitorId();
        // }

        const erxesSettings = getErxesSettings();
        const messengerSettings = erxesSettings?.messenger;
        const { email, phone, code, data, companyData } =
          messengerSettings || {};

        const variables = email
          ? {
              channelId,
              visitorId: null,
              cachedCustomerId: cachedCustomerId || undefined,
              email,
              isUser: true,
              phone,
              code,
              data,
              companyData,
            }
          : {
              channelId,
              visitorId,
              cachedCustomerId: cachedCustomerId || undefined,
              isUser: false,
            };

        const response = await apolloClient.mutate({
          mutation: connect(isCloudFlareEnabled, isTicketEnabled),
          variables,
        });

        setResult(response as any);

        const connectionData = response?.data?.widgetsMessengerConnect;
        if (connectionData) {
          setConnection((prev: IConnectionInfo) => ({
            ...prev,
            widgetsMessengerConnect: {
              ...prev.widgetsMessengerConnect,
              visitorId: connectionData.visitorId,
              customerId: connectionData.customerId,
              messengerData: connectionData.messengerData,
              uiOptions: connectionData.uiOptions,
            },
          }));
          setIntegrationId(connectionData.integrationId);
          setUiOptions(connectionData.uiOptions as IWidgetUiOptions);
          // Apply uiOptions to Tailwind CSS
          if (connectionData.uiOptions) {
            applyUiOptionsToTailwind(connectionData.uiOptions);
          }
        }
      } catch (err) {
        console.warn('useConnect error:', err);
        setError(err as any);
      } finally {
        setLoading(false);
      }
    };

    executeConnection();
  }, [isCloudFlareEnabled, isTicketEnabled, channelId]);

  return {
    result,
    loading,
    error,
  };
};
