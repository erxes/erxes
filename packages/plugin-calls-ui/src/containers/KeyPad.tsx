import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { mutations, queries } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import KeyPad from '../components/Keypad';
import client from '@erxes/ui/src/apolloClient';

type IProps = {
  callUserIntegrations: any;
  setConfig: any;
  phoneNumber: any;
};

const KeyPadContainer = (props: IProps) => {
  const { callUserIntegrations, setConfig, phoneNumber } = props;

  const [customer, setCustomer] = useState<any>(undefined);
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  const createCustomer = (
    inboxIntegrationId: string,
    primaryPhone: string,
    callID: string,
  ) => {
    if (callID) {
      createCustomerMutation({
        variables: {
          inboxIntegrationId,
          primaryPhone,
          direction: 'outgoing',
          callID,
        },
      })
        .then(({ data }: any) => {
          setCustomer(data.callAddCustomer.customer);
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }
  };

  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callUserIntegrations={callUserIntegrations}
      setConfig={setConfig}
      customer={customer}
      disconnectCall={disconnectCall}
      phoneNumber={phoneNumber || ''}
    />
  );
};

export default KeyPadContainer;
