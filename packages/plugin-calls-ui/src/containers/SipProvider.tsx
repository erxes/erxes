import React, { useState, useEffect } from 'react';
import SipProvider from '../components/SipProvider';

import IncomingCallContainer from './IncomingCall';
import WidgetContainer from './Widget';
import { CALL_DIRECTION_INCOMING } from '../lib/enums';
import { queries, mutations, subscriptions } from '../graphql';
import { useQuery, gql, useMutation, useSubscription } from '@apollo/client';

import { ModalTrigger } from '@erxes/ui/src/components';
import { Alert } from '@erxes/ui/src/utils';
import CallIntegrationForm from '../components/Form';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import TerminateSessionForm from '../components/TerminateCallForm';
import { setLocalStorage } from '../utils';

const SipProviderContainer = (props) => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:call_integrations')),
  );
  const callInfo = JSON.parse(localStorage.getItem('callInfo'));
  const sessionCode = sessionStorage.getItem('sessioncode');

  const isConnectCallRequested = JSON.parse(
    localStorage.getItem('isConnectCallRequested'),
  );

  const { data, loading, error } = useQuery(
    gql(queries.callIntegrationsOfUser),
  );
  const {
    data: activeSession,
    loading: activeSessionLoading,
    error: activeSessionError,
    refetch,
  } = useQuery(gql(queries.activeSession), {});

  const [createActiveSession] = useMutation(gql(mutations.addActiveSession));
  const [removeActiveSession] = useMutation(
    gql(mutations.callTerminateSession),
  );

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
        });
        setLocalStorage(false, false);
        localStorage.removeItem('isConnectCallRequested');
      }
    },
  });

  const createSession = () => {
    createActiveSession()
      .then(() => {
        refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const removeSession = () => {
    removeActiveSession()
      .then(() => {
        refetch();

        if (config) {
          setConfig({
            inboxId: config.inboxId,
            phone: config.phone,
            wsServer: config.wsServer,
            token: config.token,
            operators: config.operators,
            isAvailable: true,
          });
          setLocalStorage(true, true);
        }
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (loading || activeSessionLoading) {
    return null;
  }
  if (error) {
    return Alert.error(error.message);
  }
  if (activeSessionError) {
    return Alert.error(activeSessionError.message);
  }

  const { callIntegrationsOfUser } = data;
  if (!callIntegrationsOfUser || callIntegrationsOfUser.length === 0) {
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
      data={callIntegrationsOfUser}
      setConfig={handleSetConfig}
    />
  );

  const terminateContent = (args) => (
    <TerminateSessionForm
      {...args}
      setConfig={handleSetConfig}
      removeActiveSession={removeSession}
    />
  );
  if (!config || !config.inboxId) {
    return (
      <ModalTrigger title="Call Config Modal" content={content} isOpen={true} />
    );
  }
  if (activeSession && activeSession.callsActiveSession) {
    if (
      (activeSession.callsActiveSession?.lastLoginDeviceId !== sessionCode ||
        isConnectCallRequested ||
        isConnectCallRequested === 'true') &&
      !callInfo?.isUnRegistered
    ) {
      return (
        <ModalTrigger
          title="Call Config Modal"
          content={terminateContent}
          isOpen={true}
        />
      );
    }
  }
  if (!config.isAvailable) {
    return (
      <WidgetContainer
        {...props}
        callIntegrationsOfUser={callIntegrationsOfUser}
        setConfig={handleSetConfig}
      />
    );
  }

  const defaultIntegration = config || callIntegrationsOfUser?.[0];

  const { wsServer, operators } = defaultIntegration || {};
  const [host, port] = wsServer?.split(':');

  const operator = operators?.[0];
  const { gsUsername, gsPassword } = operator || {};

  const sipConfig = {
    host,
    pathname: '/ws',
    user: gsUsername,
    password: gsPassword,
    // autoRegister: true,
    port: parseInt(port?.toString() || '8089', 10),
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  return (
    <SipProvider
      {...sipConfig}
      createSession={createSession}
      callsActiveSession={activeSession?.callsActiveSession}
    >
      {(state) =>
        state?.callDirection === CALL_DIRECTION_INCOMING ? (
          <IncomingCallContainer
            {...props}
            callIntegrationsOfUser={callIntegrationsOfUser}
          />
        ) : (
          <WidgetContainer
            {...props}
            callIntegrationsOfUser={callIntegrationsOfUser}
            setConfig={handleSetConfig}
          />
        )
      }
    </SipProvider>
  );
};

export default withCurrentUser(SipProviderContainer);
