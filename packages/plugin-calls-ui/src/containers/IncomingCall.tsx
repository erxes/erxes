import React from 'react';
import IncomingCall from '../components/IncomingCall';
import { subscriptions } from '../graphql';
import { useSubscription, gql } from '@apollo/client';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  currentUser: IUser;
};

const IncomingCallContainer = (props: Props) => {
  const { currentUser } = props;
  const { data } = useSubscription(gql(subscriptions.phoneCallReceived), {
    variables: {
      userId: currentUser ? currentUser._id : ''
    },
    skip: !currentUser
  });

  if (!data || !data.phoneCallReceived) {
    return null;
  }

  const callData = data && data.phoneCallReceived;

  return <IncomingCall callData={callData} />;
};

const WithCurrentUser = withCurrentUser(IncomingCallContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
