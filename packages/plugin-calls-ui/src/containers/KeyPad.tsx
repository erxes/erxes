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
  const [conversation, setConversation] = useState<any>(undefined);
  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const [addInternalNotes] = useMutation(gql(mutations.conversationMessageAdd));
  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  const getCustomerDetail = (phoneNumber?: string) => {
    if (!phoneNumber) {
      return null;
    }

    client
      .query({
        query: gql(queries.callCustomerDetail),
        fetchPolicy: 'network-only',
        variables: { callerNumber: phoneNumber },
      })
      .then(({ data }: { data: any }) => {
        if (data && data.callsCustomerDetail) {
          setCustomer(data.callsCustomerDetail);
        }
      })
      .catch((error) => {
        console.log(error.message); // tslint:disable-line
      });

    return;
  };

  const addNote = (conversationId: string, content: any) => {
    addInternalNotes({
      variables: {
        content,
        conversationId,
        internal: true,
      },
    })
      .then(() => {
        Alert.success('Successfully added note');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

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
          setCustomer(data.callAddCustomer?.customer);
          setConversation(data.callAddCustomer?.conversation);
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }
  };

  const toggleSection = (phoneNumber): void => {
    getCustomerDetail(phoneNumber);
  };

  const taggerRefetchQueries = [
    {
      query: gql(queries.callCustomerDetail),
      variables: { callerNumber: customer?.primaryPhone },
      skip: !customer?.primaryPhone,
    },
  ];

  return (
    <KeyPad
      addCustomer={createCustomer}
      key={1}
      callUserIntegrations={callUserIntegrations}
      setConfig={setConfig}
      customer={customer}
      toggleSectionWithPhone={toggleSection}
      taggerRefetchQueries={taggerRefetchQueries}
      conversation={conversation}
      addNote={addNote}
      disconnectCall={disconnectCall}
      phoneNumber={phoneNumber || ''}
    />
  );
};

export default KeyPadContainer;
