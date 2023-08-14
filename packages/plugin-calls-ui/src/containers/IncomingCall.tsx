import React from 'react';
import IncomingCall from '../components/IncomingCall';
import { subscriptions } from '../graphql';
import { useSubscription, gql } from '@apollo/client';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { Spinner } from '@erxes/ui/src/components';

type Props = {
  currentUser: IUser;
};

const IncomingCallContainer = (props: Props) => {
  const { currentUser } = props;
  const { data, loading } = useSubscription(
    gql(subscriptions.phoneCallReceived),
    {
      variables: {
        userId: currentUser ? currentUser._id : ''
      },
      skip: !currentUser
    }
  );

  if (loading) {
    return <Spinner />;
  }

  const callData = data && data.phoneCallReceived;

  return <IncomingCall callData={callData} />;
};

const WithCurrentUser = withCurrentUser(IncomingCallContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
