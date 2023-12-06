import React, { useEffect, useState } from 'react';
import IncomingCall from '../components/IncomingCall';

import { __ } from '@erxes/ui/src/utils/core';
import { callPropType } from '../lib/types';

import { gql, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import queries from '../graphql/queries';

interface Props {
  closeModal?: () => void;
  callIntegrationsOfUser: any;
}

const IncomingCallContainer = (props: Props, context) => {
  const [customer, setCustomer] = useState<any>(undefined);
  const [conversation, setConversation] = useState<any>(undefined);

  const [hasMicrophone, setHasMicrophone] = useState(false);

  const { callIntegrationsOfUser } = props;
  const { call } = context;

  const phoneNumber = context?.call?.counterpart?.slice(
    context.call.counterpart.indexOf(':') + 1,
    context.call.counterpart.indexOf('@')
  );

  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations'
  );
  const inboxId =
    JSON.parse(defaultCallIntegration)?.inboxId ||
    callIntegrationsOfUser?.[0]?.inboxId;

  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const [addInternalNotes] = useMutation(gql(mutations.conversationMessageAdd));

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasMicrophone(true);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');
        setHasMicrophone(false);

        Alert.error(errorMessage);
      });

    if (phoneNumber && call?.id) {
      createCustomerMutation({
        variables: {
          inboxIntegrationId: inboxId,
          primaryPhone: phoneNumber,
          direction: 'incoming',
          callID: call.id
        }
      })
        .then(({ data }: any) => {
          setCustomer(data.callAddCustomer?.customer);
          setConversation(data.callAddCustomer?.conversation);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  }, [phoneNumber, call?.id]);

  const addNote = (conversationId: string, content: any) => {
    addInternalNotes({
      variables: {
        content,
        conversationId,
        internal: true
      }
    })
      .then(() => {
        Alert.success('Successfully added note');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

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
    <IncomingCall
      customer={customer}
      toggleSectionWithPhone={toggleSection}
      taggerRefetchQueries={taggerRefetchQueries}
      conversation={conversation}
      hasMicrophone={hasMicrophone}
      addNote={addNote}
    />
  );
};

IncomingCallContainer.contextTypes = {
  call: callPropType
};

export default IncomingCallContainer;
