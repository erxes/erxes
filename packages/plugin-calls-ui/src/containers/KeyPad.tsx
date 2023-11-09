import React, { useState } from 'react';

import { mutations, queries } from '../graphql';
import { gql, useMutation } from '@apollo/client';
import client from '@erxes/ui/src/apolloClient';
import { Alert } from '@erxes/ui/src/utils';

import KeyPad from '../components/Keypad';
import { ICallConversation } from '../types';

const KeyPadContainer = ({ callIntegrationsOfUser, setConfig }) => {
  const [customer, setCustomer] = useState<any>(undefined);
  const [conversation, setConversation] = useState<ICallConversation>(
    undefined
  );
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));

  const getCustomerDetail = (phoneNumber?: string) => {
    if (!phoneNumber) {
      return null;
    }

    client
      .query({
        query: gql(queries.callCustomerDetail),
        fetchPolicy: 'network-only',
        variables: { callerNumber: phoneNumber }
      })
      .then(({ data }: { data: any }) => {
        if (data && data.callsCustomerDetail) {
          setCustomer(data.callsCustomerDetail);
        }
      })
      .catch(error => {
        console.log(error.message); // tslint:disable-line
      });

    return;
  };

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
      .then(({ data }: any) => {
        setCustomer(data.callAddCustomer?.customer);
        setConversation(data.callAddCustomer?.conversation);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const toggleSection = (phoneNumber): void => {
    getCustomerDetail(phoneNumber);
  };

  const taggerRefetchQueries = [
    {
      query: gql(queries.callCustomerDetail),
      variables: { callerNumber: customer?.primaryPhone },
      skip: !customer?.primaryPhone
    }
  ];

  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callIntegrationsOfUser={callIntegrationsOfUser}
      setConfig={setConfig}
      customer={customer}
      toggleSectionWithPhone={toggleSection}
      taggerRefetchQueries={taggerRefetchQueries}
      conversation={conversation}
    />
  );
};

export default KeyPadContainer;
