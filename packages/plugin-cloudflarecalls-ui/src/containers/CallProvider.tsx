import React, { useEffect, useState } from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { queries, subscriptions } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';

import { CallWrapper } from '../styles';
import IncomingCallContainer from './IncomingCall';

import WidgetContainer from './Widget';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

const CallProviderContainer = (props) => {
  const { currentUser } = props;
  const [hideIncomingCall, setHideIncomingCall] = useState(false);

  const [isCallReceive, setIsCallReceive] = useState(false);
  const [callInfo, setCallInfo] = useState({}) as any;
  const { data, loading, error } = useQuery(gql(queries.callUserIntegrations));

  useSubscription(gql(subscriptions.webCallReceived), {
    variables: { roomState: 'ready', userId: currentUser?._id },
    skip: isCallReceive,
    onSubscriptionData: (data) => {
      if (
        data &&
        data.subscriptionData.data?.cloudflareReceiveCall?.roomState === 'ready'
      ) {
        setIsCallReceive(true);
        setCallInfo(data.subscriptionData.data?.cloudflareReceiveCall);
      }
    },
  });

  if (loading) {
    return null;
  }
  if (error) {
    return Alert.error(error.message);
  }

  const { cloudflareCallsUserIntegrations } = data;

  if (
    !cloudflareCallsUserIntegrations ||
    cloudflareCallsUserIntegrations.length === 0
  ) {
    return null;
  }

  if (callInfo && isCallReceive) {
    return (
      <IncomingCallContainer
        {...props}
        callUserIntegrations={cloudflareCallsUserIntegrations}
        hideIncomingCall={hideIncomingCall}
        setIsCallReceive={setIsCallReceive}
        currentCallConversationId={callInfo.conversationId || ''}
        phoneNumber={callInfo?.callerNumber}
        audioTrack={callInfo?.audioTrack}
      />
    );
  }

  return (
    <CallWrapper>
      <WidgetContainer
        {...props}
        setHideIncomingCall={setHideIncomingCall}
        hideIncomingCall={hideIncomingCall}
      />
    </CallWrapper>
  );
};

export default withCurrentUser(CallProviderContainer);
