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

  useEffect(() => {
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
          setCustomer(data.callAddCustomer);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  }, [phoneNumber, call?.id]);

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
    />
  );
};

IncomingCallContainer.contextTypes = {
  call: callPropType
};

export default IncomingCallContainer;
