import React from 'react';
import IncomingCall from '../components/IncomingCall';
import { subscriptions } from '../graphql';
import { useSubscription, gql } from '@apollo/client';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  currentUser: IUser;
};

const IncomingCallContainer = (props: Props) => {
  // apply subscription to get incoming call
  const { currentUser } = props;
  const { data, loading } = useSubscription(
    gql(subscriptions.phoneCallReceived),
    {
      variables: {
        userId: currentUser._id
      }
    }
  );

  const callData = data && data.phoneCallReceived;

  return <IncomingCall callData={callData} />;
};

export default IncomingCallContainer;
