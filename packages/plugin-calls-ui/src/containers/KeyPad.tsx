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
  const [updateDndMutation] = useMutation(gql(mutations.callsUpdateSipDnd));

  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  const {
    data: callDndStatus,
    loading,
    refetch,
  } = useQuery(gql(queries.callsGetDndStatus), {
    variables: {
      integrationId: inboxId,
    },
  });

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

  const pauseExtention = (integrationId: string, dndStatus: string) => {
    updateDndMutation({
      variables: {
        dndStatus,
        integrationId,
      },
    })
      .then(() => {
        const isPaused = dndStatus === 'yes' ? 'paused' : 'unpaused';
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

  const dndStatus = callDndStatus.callsGetOperatorDndStatus;
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
      dndStatus={dndStatus}
    />
  );
};

export default KeyPadContainer;
