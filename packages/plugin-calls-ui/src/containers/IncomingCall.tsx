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
        userId: '123'
      }
    }
  );

  console.log('loading', loading);
  console.log('data', data);

  return <IncomingCall />;
};

export default IncomingCallContainer;
