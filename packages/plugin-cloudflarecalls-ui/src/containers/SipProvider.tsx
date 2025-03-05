import React, { useState } from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { queries, subscriptions } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';

import { CallWrapper } from '../styles';
import IncomingCallContainer from './IncomingCall';

import WidgetContainer from './Widget';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

const SipProviderContainer = (props) => {
  const { currentUser } = props;
  const isAvialable = JSON.parse(
    localStorage.getItem('config:cloudflareCall') || '{}',
  ).isAvailable;
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:cloudflareCalls') || '{}'),
  );

  const [hideIncomingCall, setHideIncomingCall] = useState(false);
  const [currentCallConversationId, setCurrentCallConversationId] =
    useState('');
  const [isCallReceive, setIsCallReceive] = useState(false);
  const [callInfo, setCallInfo] = useState({}) as any;
  const { data, loading, error } = useQuery(gql(queries.callUserIntegrations));

  useSubscription(gql(subscriptions.webCallReceived), {
    skip: !isAvialable,
    variables: { roomState: 'ready', userId: currentUser?._id },
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

  const handleSetConfig = (item) => {
    if (item) {
      setConfig(item);
    }
  };

  if (callInfo && isCallReceive) {
    return (
      <IncomingCallContainer
        {...props}
        callUserIntegrations={cloudflareCallsUserIntegrations}
        hideIncomingCall={hideIncomingCall}
        setIsCallReceive={setIsCallReceive}
        currentCallConversationId={currentCallConversationId || ''}
        phoneNumber={callInfo?.callerNumber}
        audioTrack={callInfo?.audioTrack}
      />
    );
  }

  return (
    <CallWrapper>
      <WidgetContainer
        {...props}
        callUserIntegrations={cloudflareCallsUserIntegrations}
        setConfig={handleSetConfig}
        setHideIncomingCall={setHideIncomingCall}
        hideIncomingCall={hideIncomingCall}
        currentCallConversationId={currentCallConversationId || ''}
      />
    </CallWrapper>
  );
};

export default withCurrentUser(SipProviderContainer);
