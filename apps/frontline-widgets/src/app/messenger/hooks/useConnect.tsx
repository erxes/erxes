import { useMutation } from '@apollo/client';
import { applyUiOptionsToTailwind } from '@libs/tw-utils';
import { removeLocalStorageItem, setLocalStorageItem } from '@libs/utils';
import { setWidgetToken } from '@libs/widgetSession';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { connect } from '../graphql';
import {
  connectionAtom,
  customerDataAtom,
  customerIdAtom,
  hasKnowledgeBaseTopicAtom,
  hasTicketConfigAtom,
  integrationIdAtom,
  messengerDataAtom,
  ticketConfigsAtom,
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
  const setHasTicketConfig = useSetAtom(hasTicketConfigAtom);
  const setTicketConfigs = useSetAtom(ticketConfigsAtom);
  const setHasKnowledgeBaseTopic = useSetAtom(hasKnowledgeBaseTopicAtom);
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
        // Every later request proves who this browser is with this token.
        setWidgetToken(connectionData.sessionToken);

        const uiOptions = connectionData.uiOptions || {
          primary: {
            DEFAULT: '#5629B6',
            foreground: '#ffffff',
          },
          navigationVariant: 'pill',
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
          setCustomerData(connectionData.customer as ICustomerData);
        } else {
          // A fresh session is a fresh visitor: forget any earlier identity.
          removeLocalStorageItem('customerId');
          setCustomerId(null);
          setCustomerData(null);
        }
        setIntegrationId(connectionData.integrationId);
        setUiOptions(uiOptions as IWidgetUiOptions);
        setTicketConfigs(connectionData.ticketConfigs as ITicketConfig[]);
        setHasTicketConfig(!!connectionData.ticketConfigs?.length);
        setHasKnowledgeBaseTopic(
          !!connectionData.messengerData?.knowledgeBaseTopicId,
        );
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

      const email = messengerData?.email;

      // Include email in the connection key so a different email triggers reconnection
      const connectionKey = `${integrationId}:${email ?? ''}`;

      if (connectionKeyRef.current === connectionKey) {
        return;
      }

      // Update ref before making the call
      connectionKeyRef.current = connectionKey;
      isConnectingRef.current = true;

      // Who this browser is travels in the session token; the site's email,
      // phone and code are only claims stored on that session's own customer.
      await connectMutation({
        variables: {
          integrationId,
          isUser: !!email,
          email,
          phone: messengerData?.phone,
          code: messengerData?.code,
          data: messengerData?.data,
          companyData: messengerData?.companyData,
        },
      });
    };

    executeConnection();
  }, [integrationId, messengerData?.email, messengerData?.phone]);

  return {
    result: data,
    loading,
    error,
    connectMutation,
  };
};
