import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  connectionAtom,
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
import {
  getErxesSettings,
  getLocalStorageItem,
  setLocalStorageItem,
} from '@libs/utils';
import { applyUiOptionsToTailwind } from '@libs/tw-utils';
import { useSaveBrowserInfo } from './useSaveBrowserInfo';
import { connect } from '../graphql';
import { customerDataAtom, customerIdAtom } from '../states';

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
  const cachedCustomerId = getLocalStorageItem('customerId');
  const setCustomerId = useSetAtom(customerIdAtom);
  const setCustomerData = useSetAtom(customerDataAtom);
  // Call useSaveBrowserInfo hook
  useSaveBrowserInfo();

  const [connectMutation, { data, loading, error }] = useMutation(connect(), {
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
        if (connectionData.customerId) {
          setLocalStorageItem('customerId', connectionData.customerId);
          setCustomerId(connectionData.customerId);
        }
        setIntegrationId(connectionData.integrationId);
        setUiOptions(connectionData.uiOptions as IWidgetUiOptions);
        setTicketConfig(connectionData.ticketConfig as ITicketConfig);
        setHasTicketConfig(!!connectionData.ticketConfig);
        // Apply uiOptions to Tailwind CSS
        if (connectionData.uiOptions) {
          applyUiOptionsToTailwind(connectionData.uiOptions);
        }
        if (connectionData.customer) {
          setCustomerData(connectionData.customer as ICustomerData);
        }
      }
    },
    onError: () => {
      // Error is handled through the error return value
    },
  });

  useEffect(() => {
    const executeConnection = async () => {
      if (!integrationId) return;

      let visitorId;

      const { getVisitorId } = await import('@libs/utils');
      visitorId = await getVisitorId();

      const { email, phone, code, data, companyData } = messengerData || {};

      const variables = email
        ? {
            integrationId,
            visitorId: visitorId || null,
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
  }, [integrationId, cachedCustomerId, connectMutation]);

  return {
    result: data,
    loading,
    error,
    connectMutation,
  };
};
