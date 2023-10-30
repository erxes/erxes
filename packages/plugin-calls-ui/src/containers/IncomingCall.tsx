import React, { useEffect } from 'react';
import IncomingCall from '../components/IncomingCall';

import { __ } from '@erxes/ui/src/utils/core';
import { callPropType } from '../lib/types';

import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

interface Props {
  closeModal?: () => void;
  data: any;
  callData?: { callerNumber: String };
  callIntegrationsOfUser: any;
}

const IncomingCallContainer = (props: Props, context) => {
  // let customerDetail;
  const { callIntegrationsOfUser } = props;

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

  // useEffect(() => {
  //   console.log(':......');
  //   const { data, loading } = useQuery(gql(queries.callCustomerDetail));
  //   createCustomerMutation({
  //     variables: {
  //       inboxIntegrationId: inboxId,
  //       primaryPhone: phoneNumber,
  //     },
  //   })
  //     .then(() => {
  //       Alert.success('Contact successfully added');
  //     })
  //     .catch((e) => {
  //       Alert.error(e.message);
  //     });
  //   if (loading) {
  //     return null;
  //   }

  //   console.log(data, 'data');
  //   const { callsCustomerDetail } = data;
  //   customerDetail = callsCustomerDetail;
  // }, []);

  return (
    <IncomingCall
      phoneNumber={phoneNumber}
      customer={{ username: phoneNumber }}
    />
  );
};

IncomingCallContainer.contextTypes = {
  call: callPropType
};

export default IncomingCallContainer;
