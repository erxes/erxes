import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import { ICustomer } from '../types';
import IncomingCall from '../components/IncomingCall';
import { __ } from '@erxes/ui/src/utils/core';
import { callPropType } from '../lib/types';
import { extractPhoneNumberFromCounterpart } from '../utils';
import { mutations, queries } from '../graphql';

interface IProps {
  closeModal?: () => void;
  callUserIntegrations: any;
  hideIncomingCall?: boolean;
  setHideIncomingCall?: (isHide: boolean) => void;
  currentCallConversationId: string;
}

const IncomingCallContainer = (props: IProps, context) => {
  const [customer, setCustomer] = useState<any>({} as ICustomer);
  const [customers, setCustomers] = useState<any>([]);

  const [channels, setChannels] = useState<any>();

  const [hasMicrophone, setHasMicrophone] = useState(false);

  const { callUserIntegrations, currentCallConversationId } = props;
  const { call } = context;

  const phoneNumber = extractPhoneNumberFromCounterpart(
    context?.call?.counterpart,
  );

  const defaultCallIntegration =
    localStorage.getItem('config:call_integrations') || '{}';
  const inboxId =
    JSON.parse(defaultCallIntegration)?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  const [createCustomerMutation] = useMutation(gql(mutations.customersAdd));
  const { data, loading } = useQuery(gql(queries.callCustomerDetail), {
    fetchPolicy: 'network-only',
    variables: {
      customerPhone: phoneNumber,
    },
  });

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => {
        setHasMicrophone(true);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');
        setHasMicrophone(false);

        Alert.error(errorMessage);
      });
  }, []);

  useEffect(() => {
    if (!loading && data?.callsCustomerDetail) {
      setCustomer(data.callsCustomerDetail);
    }
  }, [loading, data]);

  useEffect(() => {
    if (props.hideIncomingCall) {
      props.setHideIncomingCall?.(false);
    }
  }, []);
  useEffect(() => {
    if (phoneNumber && call?.id) {
      createCustomerMutation({
        variables: {
          inboxIntegrationId: inboxId,
          primaryPhone: phoneNumber,
          queueName: call.groupName || '',
        },
      })
        .then(({ data }: any) => {
          if (data?.callAddCustomer?.customer) {
            setCustomers([data.callAddCustomer.customer]);
            setChannels(data.callAddCustomer.channels);
          }
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }
  }, [phoneNumber, call?.id]);

  return (
    <IncomingCall
      customers={customers}
      customer={customer}
      channels={channels}
      hasMicrophone={hasMicrophone}
      phoneNumber={phoneNumber}
      hideIncomingCall={props.hideIncomingCall}
      inboxId={inboxId}
      currentCallConversationId={currentCallConversationId}
    />
  );
};

IncomingCallContainer.contextTypes = {
  call: callPropType,
};

export default IncomingCallContainer;
