import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { mutations } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import KeyPad from '../components/Keypad';

type IProps = {
  callUserIntegrations: any;
  setConfig: any;
  phoneNumber: any;
  currentCallConversationId: string;
};

const KeyPadContainer = (props: IProps) => {
  const {
    callUserIntegrations,
    setConfig,
    phoneNumber,
    currentCallConversationId,
  } = props;

  const [customer, setCustomer] = useState<any>(undefined);
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));

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

  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callUserIntegrations={callUserIntegrations}
      setConfig={setConfig}
      customer={customer}
      phoneNumber={phoneNumber || ''}
      currentCallConversationId={currentCallConversationId}
    />
  );
};

export default KeyPadContainer;
