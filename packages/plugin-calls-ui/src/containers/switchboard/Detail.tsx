import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { gql, useQuery, useSubscription } from '@apollo/client';

import Detail from '../../components/switchboard/Detail';
import { queries, subscriptions } from '../../graphql';
import { Spinner } from '@erxes/ui/src/components';
import { useParams } from 'react-router-dom';

function DetailContainer() {
  const { queue } = useParams();

  const { data: inititalWaitingCall, loading: initialWaitingLoading } =
    useQuery(gql(queries.callWaitingList), {
      variables: {
        queue,
      },
      fetchPolicy: 'network-only',
      pollInterval: 3 * 60 * 1000,
    });

  const { data: initialTalkingCall, loading: initialTalkingLoading } = useQuery(
    gql(queries.callProceedingList),
    {
      variables: {
        queue,
      },
      pollInterval: 3 * 60 * 1000,
    },
  );

  const { data: waitingCall } = useSubscription(
    gql(subscriptions.waitingCallReceived),
    {
      variables: {
        extension: queue,
      },
    },
  );
  const { data: talkingCall } = useSubscription(
    gql(subscriptions.talkingCallReceived),
    {
      variables: {
        extension: queue,
      },
    },
  );

  const { data: agentList } = useSubscription(
    gql(subscriptions.agentCallReceived),
    {
      variables: {
        extension: queue,
      },
    },
  );

  if (initialWaitingLoading || initialTalkingLoading) {
    return <Spinner />;
  }

  const updatedProps = {
    waitingList: waitingCall?.waitingCallReceived,
    proceedingList: talkingCall?.talkingCallReceived,
    memberList: agentList?.agentCallReceived,
    initialTalkingCall: initialTalkingCall.callProceedingList,
    initialWaitingCall: inititalWaitingCall.callWaitingList,
  };

  return <Detail {...updatedProps} />;
}

export default DetailContainer;
