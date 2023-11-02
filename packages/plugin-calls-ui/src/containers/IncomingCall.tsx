import React, { useEffect, useState } from 'react';
import IncomingCall from '../components/IncomingCall';

import { __ } from '@erxes/ui/src/utils/core';
import { callPropType } from '../lib/types';

import { gql, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

interface Props {
  closeModal?: () => void;
  callIntegrationsOfUser: any;
}

const IncomingCallContainer = (props: Props, context) => {
  const [customer, setCustomer] = useState<any>(undefined);
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

  useEffect(() => {
    if (phoneNumber) {
      createCustomerMutation({
        variables: {
          inboxIntegrationId: inboxId,
          primaryPhone: phoneNumber
        }
      })
        .then(({ data }: any) => {
          setCustomer(data.callAddCustomer);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  }, [phoneNumber]);

  return <IncomingCall customer={customer} />;
};

IncomingCallContainer.contextTypes = {
  call: callPropType
};

export default IncomingCallContainer;
