import { useMutation } from '@apollo/client';
import { applyUiOptionsToTailwind } from '@libs/tw-utils';
import {
  getLocalStorageItem,
  getVisitorId,
  setLocalStorageItem,
} from '@libs/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { connect } from '../graphql';
import {
  connectionAtom,
  customerDataAtom,
  customerIdAtom,
  hasTicketConfigAtom,
  integrationIdAtom,
  messengerDataAtom,
  ticketConfigAtom,
  uiOptionsAtom,
} from '../states';
import {
  IConnectionInfo,
  ICustomerData,
  ITicketConfig,
  IWidgetUiOptions,
} from '../types/connection';
import { useSaveBrowserInfo } from './useSaveBrowserInfo';

interface connectionProps {
  integrationId: string;
}

export const useConnect = ({ integrationId }: connectionProps) => {
  const setConnection = useSetAtom(connectionAtom);
  const setIntegrationId = useSetAtom(integrationIdAtom);
  const messengerData = useAtomValue(messengerDataAtom);
  const setUiOptions = useSetAtom(uiOptionsAtom);
  const setTicketConfig = useSetAtom(ticketConfigAtom);
  const setHasTicketConfig = useSetAtom(hasTicketConfigAtom);
  const setCustomerId = useSetAtom(customerIdAtom);
  const setCustomerData = useSetAtom(customerDataAtom);
  const connectionKeyRef = useRef<string>('');
  const isConnectingRef = useRef(false);

  // Call useSaveBrowserInfo hook
  useSaveBrowserInfo();

  const [connectMutation, { data, loading, error }] = useMutation(connect(), {
    onCompleted: (response) => {
      isConnectingRef.current = false;
      const connectionData = response?.widgetsMessengerConnect;
      if (connectionData) {
        const uiOptions = connectionData.uiOptions || {
          primary: {
            DEFAULT: '#5629B6',
            foreground: '#FFF',
          },
        };

        setConnection((prev: IConnectionInfo) => ({
          ...prev,
          widgetsMessengerConnect: {
            ...prev.widgetsMessengerConnect,
            visitorId: connectionData.visitorId,
            customerId: connectionData.customerId,
            messengerData: connectionData.messengerData,
            uiOptions,
          },
        }));
        if (connectionData.customerId) {
          setLocalStorageItem('customerId', connectionData.customerId);
          setCustomerId(connectionData.customerId);
        }
        setIntegrationId(connectionData.integrationId);
        setUiOptions(uiOptions as IWidgetUiOptions);
        setTicketConfig(connectionData.ticketConfig as ITicketConfig);
        setHasTicketConfig(!!connectionData.ticketConfig);
        // Apply uiOptions to Tailwind CSS
        if (uiOptions) {
          applyUiOptionsToTailwind(uiOptions);
        }
        if (connectionData.customer) {
          setCustomerData(connectionData.customer as ICustomerData);
        }
      }
    },
    onError: () => {
      isConnectingRef.current = false;
      // Error is handled through the error return value
    },
  });

  useEffect(() => {
    const executeConnection = async () => {
      if (!integrationId || isConnectingRef.current) return;

      // Only integrationId is essential for connection - other fields are optional
      // Only connect if integrationId has changed
      if (connectionKeyRef.current === integrationId) {
        return;
      }

      // Update ref before making the call
      connectionKeyRef.current = integrationId;
      isConnectingRef.current = true;

      // Get fresh values from messengerData and localStorage
      const currentCachedCustomerId = getLocalStorageItem('customerId');
      const email = messengerData?.email;
      const phone = messengerData?.phone;
      const code = messengerData?.code;
      const customData = messengerData?.data;
      const companyData = messengerData?.companyData;

      const visitorId = await getVisitorId();

      const variables = email
        ? {
            integrationId,
            visitorId: visitorId || null,
            cachedCustomerId: currentCachedCustomerId || undefined,
            isUser: true,
            email,
            phone,
            code,
            data: customData,
            companyData,
          }
        : {
            integrationId,
            visitorId,
            cachedCustomerId: currentCachedCustomerId || undefined,
            isUser: false,
          };

      await connectMutation({ variables });
    };

    executeConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationId]);

  return {
    result: data,
    loading,
    error,
    connectMutation,
  };
};
