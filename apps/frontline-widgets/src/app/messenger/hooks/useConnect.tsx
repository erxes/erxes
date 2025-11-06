import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
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
  integrationId: string;
}

export const useConnect = ({
  isCloudFlareEnabled = false,
  isTicketEnabled = false,
  integrationId,
}: connectionProps) => {
  const setConnection = useSetAtom(connectionAtom);
  const setIntegrationId = useSetAtom(integrationIdAtom);
  const setUiOptions = useSetAtom(uiOptionsAtom);
  const cachedCustomerId = getLocalStorageItem('customerId');

  // Call useSaveBrowserInfo hook
  useSaveBrowserInfo();

  const [connectMutation, { data, loading, error }] = useMutation(
    connect(isCloudFlareEnabled, isTicketEnabled),
    {
      onCompleted: (response) => {
        const connectionData = response?.widgetsMessengerConnect;
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
      },
      onError: () => {
        // Error is handled through the error return value
      },
    },
  );

  useEffect(() => {
    const executeConnection = async () => {
      if (!integrationId) return;

      let visitorId;

      // if (!cachedCustomerId) {
      const { getVisitorId } = await import('@libs/utils');

      visitorId = await getVisitorId();
      // }

      const erxesSettings = getErxesSettings();
      const messengerSettings = erxesSettings?.messenger;
      const { email, phone, code, data, companyData } = messengerSettings || {};

      const variables = email
        ? {
            integrationId,
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
            integrationId,
            visitorId,
            cachedCustomerId: cachedCustomerId || undefined,
            isUser: false,
          };

      await connectMutation({ variables });
    };

    executeConnection();
  }, [
    isCloudFlareEnabled,
    isTicketEnabled,
    integrationId,
    cachedCustomerId,
    connectMutation,
  ]);

  return {
    result: data,
    loading,
    error,
  };
};
