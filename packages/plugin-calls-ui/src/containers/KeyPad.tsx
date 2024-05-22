import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import KeyPad from '../components/Keypad';
import { Spinner } from '@erxes/ui/src/components';

type IProps = {
  callUserIntegrations: any;
  setConfig: any;
  phoneNumber: any;
};

const KeyPadContainer = (props: IProps) => {
  const { callUserIntegrations, setConfig, phoneNumber } = props;

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const inboxId =
    JSON.parse(defaultCallIntegration || '{}')?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  const [customer, setCustomer] = useState<any>(undefined);
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const [updatePauseAgent] = useMutation(gql(mutations.callPauseAgent));

  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  const {
    data: agentStatusData,
    loading,
    refetch,
  } = useQuery(gql(queries.callGetAgentStatus));

  const createCustomer = (inboxIntegrationId: string, primaryPhone: string) => {
    createCustomerMutation({
      variables: {
        inboxIntegrationId,
        primaryPhone,
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
        const isPaused = agentStatus === 'yes' ? 'paused' : 'unpaused';

        Alert.success(`Successfully ${isPaused}`);
        refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  const agentStatus = agentStatusData.callGetAgentStatus;
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
      agentStatus={agentStatusData}
    />
  );
};

export default KeyPadContainer;
