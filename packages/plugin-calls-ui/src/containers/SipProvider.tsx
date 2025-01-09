import * as moment from 'moment';

import React, { useState } from 'react';
import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import { mutations, queries, subscriptions } from '../graphql';

import { Alert } from '@erxes/ui/src/utils';
import { CALL_DIRECTION_INCOMING } from '../lib/enums';
import CallIntegrationForm from '../components/Form';
import { CallWrapper } from '../styles';
import IncomingCallContainer from './IncomingCall';
import { ModalTrigger } from '@erxes/ui/src/components';
import SipProvider from '../components/SipProvider';
import WidgetContainer from './Widget';
import { setLocalStorage } from '../utils';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

const SipProviderContainer = (props) => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:call_integrations') || '{}'),
  );
  const callInfo = JSON.parse(localStorage.getItem('callInfo') || '{}');
  const isConnectCallRequested = JSON.parse(
    localStorage.getItem('isConnectCallRequested') || '{}',
  );
  const [historyId, setHistoryId] = useState('');
  const [hideIncomingCall, setHideIncomingCall] = useState(false);
  const [currentCallConversationId, setCurrentCallConversationId] =
    useState('');

  const { data, loading, error } = useQuery(gql(queries.callUserIntegrations));
  const { data: callConfigData, loading: callConfigLoading } = useQuery(
    gql(queries.callsGetConfigs),
  );

  const [createActiveSession] = useMutation(gql(mutations.addActiveSession));
  const [updateHistoryMutation] = useMutation(gql(mutations.callHistoryEdit));
  const [addHistoryMutation] = useMutation(gql(mutations.callHistoryAdd));

  useSubscription(gql(subscriptions.sessionTerminateRequested), {
    variables: { userId: props.currentUser._id },
    onSubscriptionData: () => {
      if (
        !callInfo?.isRegistered ||
        isConnectCallRequested ||
        isConnectCallRequested === 'true'
      ) {
        setConfig({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: true,
          queues: config?.queues || [],
        });
        setLocalStorage(true, true);
        localStorage.removeItem('isConnectCallRequested');
      } else {
        setConfig({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: false,
          queues: config?.queues || [],
        });
        setLocalStorage(false, false);
        localStorage.removeItem('isConnectCallRequested');
      }
    },
  });
  const createSession = () => {
    createActiveSession()
      .then(() => {})
      .catch((e) => {
        Alert.error(e.message);
      });
  };
  const updateHistory = (
    timeStamp: number,
    callStartTime: Date,
    callEndTime: Date,
    callStatus: string,
    direction: string,
    customerPhone: string,
    transferStatus?: string,
    endedBy?: string,
  ) => {
    const transferredCallStatus = localStorage.getItem('transferredCallStatus');
    let duration = 0;
    if (callStartTime && callEndTime) {
      const startedMoment = moment(callStartTime);
      const endedMoment = moment(callEndTime);
      duration = endedMoment.diff(startedMoment, 'seconds');
    }
    if (historyId) {
      updateHistoryMutation({
        variables: {
          id: historyId,
          timeStamp: parseInt(timeStamp.toString()),
          callStartTime,
          callEndTime,
          callDuration: duration,
          callStatus,
          callType: direction,
          customerPhone,
          transferredCallStatus: transferStatus
            ? 'remote'
            : transferredCallStatus,
          endedBy,
        },
        refetchQueries: ['callHistories'],
      })
        .then(() => {
          setHistoryId('');
        })
        .catch((e) => {
          setHistoryId('');

          if (e.message !== 'You cannot edit') {
            Alert.error(e.message);
          }
        });
    } else {
      if (callStatus === 'cancelled') {
        updateHistoryMutation({
          variables: {
            timeStamp: parseInt(timeStamp.toString()),
            callStartTime,
            callEndTime,
            callDuration: duration,
            callStatus,
            inboxIntegrationId: config?.inboxId || '',
            customerPhone,
            callType: direction,
            endedBy,
          },
          refetchQueries: ['callHistories'],
        })
          .then(() => {
            setHistoryId('');
          })
          .catch((e) => {
            setHistoryId('');

            if (e.message !== 'You cannot edit') {
              Alert.error(e.message);
            }
          });
      } else {
        Alert.error('History id not found');
      }
    }
  };
  const addHistory = (
    callStatus: string,
    timeStamp: number,
    direction: string,
    customerPhone: string,
    callStartTime: Date,
    queueName?: string | null,
  ) => {
    addHistoryMutation({
      variables: {
        timeStamp: parseInt(timeStamp.toString()),
        callType: direction,
        callStatus,
        customerPhone,
        inboxIntegrationId: config?.inboxId || '',
        callStartTime,
        queueName,
      },
    })
      .then(({ data }: any) => {
        const callHistoryId = data?.callHistoryAdd?._id;
        const callConversationId = data?.callHistoryAdd?.conversationId;
        setHistoryId(callHistoryId);
        setCurrentCallConversationId(callConversationId);

        Alert.success('Successfully updated status');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (loading || callConfigLoading) {
    return null;
  }
  if (error) {
    return Alert.error(error.message);
  }

  const { callUserIntegrations } = data;
  const callsGetConfigs = callConfigData.callsGetConfigs;

  if (!callUserIntegrations || callUserIntegrations.length === 0) {
    return null;
  }

  const handleSetConfig = (item) => {
    if (item) {
      setConfig(item);
    }
  };

  const content = (args) => (
    <CallIntegrationForm
      {...args}
      data={callUserIntegrations}
      setConfig={handleSetConfig}
    />
  );

  if (!config || !config.inboxId) {
    return (
      <ModalTrigger title="Call Config Modal" content={content} isOpen={true} />
    );
  }

  if (!config.isAvailable) {
    return (
      <CallWrapper>
        <WidgetContainer
          {...props}
          callUserIntegrations={callUserIntegrations}
          setConfig={handleSetConfig}
        />
      </CallWrapper>
    );
  }

  const filteredIntegration = callUserIntegrations.find(
    (integrationConfig) => integrationConfig.phone === config.phone,
  );
  const defaultIntegration = config || filteredIntegration;

  const { wsServer, operators } = defaultIntegration || {};
  const [host = 'call.erxes.io', port = '8089'] = wsServer?.split(':');

  const operator = operators?.[0];
  const { gsUsername, gsPassword } = operator || {};

  const configsMap = {};

  for (const config of callsGetConfigs) {
    configsMap[config.code] = config.value;
  }

  const {
    STUN_SERVER_URL,
    TURN_SERVER_URL,
    TURN_SERVER_USERNAME,
    TURN_SERVER_CREDENTIAL,
  } = configsMap as any;

  const sipConfig = {
    host,
    pathname: '/ws',
    user: gsUsername,
    password: gsPassword,
    // autoRegister: true,
    port: parseInt(port?.toString() || '8089', 10),
    iceServers: [
      {
        urls: `turn:${TURN_SERVER_URL}` || '',
        username: TURN_SERVER_USERNAME || '',
        credential: TURN_SERVER_CREDENTIAL || '',
      },
      {
        urls: `stun:${STUN_SERVER_URL}` || '',
      },
    ],
  };

  return (
    <CallWrapper>
      <SipProvider
        {...sipConfig}
        createSession={createSession}
        updateHistory={updateHistory}
        addHistory={addHistory}
        callUserIntegration={filteredIntegration}
      >
        {(state) => (
          <>
            {state?.callDirection === CALL_DIRECTION_INCOMING && (
              <IncomingCallContainer
                {...props}
                callUserIntegrations={callUserIntegrations}
                hideIncomingCall={hideIncomingCall}
                currentCallConversationId={currentCallConversationId || ''}
              />
            )}
            <WidgetContainer
              {...props}
              callUserIntegrations={callUserIntegrations}
              setConfig={handleSetConfig}
              setHideIncomingCall={setHideIncomingCall}
              hideIncomingCall={hideIncomingCall}
              currentCallConversationId={currentCallConversationId || ''}
            />
          </>
        )}
      </SipProvider>
    </CallWrapper>
  );
};

export default withCurrentUser(SipProviderContainer);
