import React from 'react';
import IncomingCall from '../components/IncomingCall';
import { subscriptions } from '../graphql';
import { useSubscription, gql } from '@apollo/client';

const IncomingCallContainer = () => {
  // apply subscription to get incoming call
  const { data, loading } = useSubscription(
    gql(subscriptions.phoneCallReceived),
    {
      variables: {
        userId: 'azkhtHgCPYrEeSyDr'
      }
    }
  );

  const callData = data && data.phoneCallReceived;

  return <IncomingCall callData={callData} />;
};

export default IncomingCallContainer;
