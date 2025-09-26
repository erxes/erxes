import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import KeyPad from '../components/Keypad';
import { sanitizePhoneNumber } from '../utils';

type IProps = {
  callUserIntegrations: any;
  setConfig: any;
  phoneNumber: any;
  currentCallConversationId: string;
  currentIntegrationId: string;
};

const KeyPadContainer = (props: IProps) => {
  const {
    callUserIntegrations,
    setConfig,
    phoneNumber,
    currentCallConversationId,
    currentIntegrationId,
  } = props;

  const [customer, setCustomer] = useState<any>(undefined);
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const [updatePauseAgent] = useMutation(gql(mutations.callPauseAgent));

  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  const {
    data: agentStatusData,
    loading,
    refetch,
  } = useQuery(gql(queries.callGetAgentStatus), {
    variables: {
      integrationId: currentIntegrationId || '',
    },
    skip: !currentIntegrationId,
    fetchPolicy: 'network-only',
  });

  const createCustomer = (inboxIntegrationId: string, primaryPhone: string) => {
    const phone = sanitizePhoneNumber(primaryPhone);
    createCustomerMutation({
      variables: {
        inboxIntegrationId,
        primaryPhone: phone,
      },
    })
      .then(({ data }: any) => {
        setCustomer(data.callAddCustomer.customer);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const pauseExtention = (integrationId: string, status: string) => {
    updatePauseAgent({
      variables: {
        status,
        integrationId,
      },
    })
      .then(() => {
        const isPaused = agentStatus === 'yes' ? 'Paused' : 'Idle';

        Alert.success(`Successfully ${isPaused}`);
        refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };
  const agentStatus = (agentStatusData?.callGetAgentStatus || '').trim();
  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callUserIntegrations={callUserIntegrations}
      setConfig={setConfig}
      customer={customer}
      disconnectCall={disconnectCall}
      phoneNumber={phoneNumber || ''}
      pauseExtention={pauseExtention}
      agentStatus={agentStatus}
      loading={loading}
      currentCallConversationId={currentCallConversationId}
    />
  );
};

export default KeyPadContainer;
