import React from 'react';

import { mutations } from '../graphql';
import { gql, useMutation } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';

import KeyPad from '../components/Keypad';
import { callPropType } from '../lib/types';

const KeyPadContainer = ({ callIntegrationsOfUser, setConfig }) => {
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));

  const createCustomer = (
    inboxIntegrationId: string,
    primaryPhone: string,
    callID: string
  ) => {
    createCustomerMutation({
      variables: {
        inboxIntegrationId,
        primaryPhone,
        direction: 'outgoing',
        callID
      }
    })
      .then(() => {})
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callIntegrationsOfUser={callIntegrationsOfUser}
      setConfig={setConfig}
    />
  );
};

export default KeyPadContainer;
