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

const SipProviderContainer = props => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:call_integrations'))
  );
  const [callInfo, setCallInfo] = useState(
    JSON.parse(localStorage.getItem('callInfo'))
  );

  const [isLogin, setisLogin] = useState(
    JSON.parse(localStorage.getItem('callInfo'))?.isLogin
  );

  const [disconnectCall] = useMutation(gql(mutations.callDisconnect));

  useEffect(() => {
    localStorage.setItem(
      'callInfo',
      JSON.stringify({
        isRegistered: false,
        isLogin: false
      })
    );

    const handleBeforeUnload = () => {
      console.log('handleBeforeUnload...');
      localStorage.removeItem('callInfo');
      localStorage.setItem(
        'config:call_integrations',
        JSON.stringify({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: true
        })
      );
      disconnectCall();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const { data, loading, error } = useQuery(
    gql(queries.callIntegrationsOfUser)
  );
  const {
    data: activeSession,
    loading: activeSessionLoading,
    error: activeSessionError,
    refetch
  } = useQuery(gql(queries.activeSession), {
    skip: isLogin
  });

  const [createActiveSession] = useMutation(gql(mutations.addActiveSession));
  const [removeActiveSession] = useMutation(
    gql(mutations.callTerminateSession)
  );

  useSubscription(gql(subscriptions.sessionTerminateRequested), {
    variables: { userId: props.currentUser._id },
    onSubscriptionData: () => {
      if (!callInfo?.isRegistered) {
        localStorage.setItem(
          'config:call_integrations',
          JSON.stringify({
            inboxId: config?.inboxId,
            phone: config?.phone,
            wsServer: config?.wsServer,
            token: config?.token,
            operators: config?.operators,
            isAvailable: true
          })
        );
        setConfig({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: true
        });
      }
      localStorage.setItem(
        'config:call_integrations',
        JSON.stringify({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: false
        })
      );
      setConfig({
        inboxId: config?.inboxId,
        phone: config?.phone,
        wsServer: config?.wsServer,
        token: config?.token,
        operators: config?.operators,
        isAvailable: false
      });
    }
  });

  const createSession = () => {
    createActiveSession()
      .then(({ data: result }: any) => {
        // console.log('data:', result);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const removeSession = () => {
    removeActiveSession()
      .then(() => {
        refetch();
        localStorage.setItem(
          'config:call_integrations',
          JSON.stringify({
            inboxId: config?.inboxId,
            phone: config?.phone,
            wsServer: config?.wsServer,
            token: config?.token,
            operators: config?.operators,
            isAvailable: true
          })
        );
        setConfig({
          inboxId: config?.inboxId,
          phone: config?.phone,
          wsServer: config?.wsServer,
          token: config?.token,
          operators: config?.operators,
          isAvailable: true
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const CallDisconnect = () => {
    disconnectCall()
      .then()
      .catch(e => {
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
  // console.log(callsActiveSession, 'activeSessionData');

  if (!callIntegrationsOfUser || callIntegrationsOfUser.length === 0) {
    return null;
  }

  const handleSetConfig = item => {
    if (item) {
      setConfig(item);
    }
  };

  const content = args => (
    <CallIntegrationForm
      {...args}
      data={callIntegrationsOfUser}
      setConfig={handleSetConfig}
    />
  );

  const terminateContent = args => (
    <TerminateSessionForm
      {...args}
      setConfig={handleSetConfig}
      removeActiveSession={removeSession}
      setCallInfo={setCallInfo}
    />
  );

  if (
    activeSession &&
    activeSession.callsActiveSession &&
    !callInfo?.isRegistered &&
    !callInfo?.isUnRegistered
  ) {
    return <ModalTrigger title="A" content={terminateContent} isOpen={true} />;
  }

  if (!config) {
    return (
      <ModalTrigger title="Call Config Modal" content={content} isOpen={true} />
    );
  }

  if (!config.isAvailable) {
    return (
      <WidgetContainer
        {...props}
        callIntegrationsOfUser={callIntegrationsOfUser}
        setConfig={handleSetConfig}
        removeActiveSession={removeSession}
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
    port: parseInt(port?.toString() || '8089', 10)
  };

  return (
    <SipProvider
      {...sipConfig}
      createSession={createSession}
      callsActiveSession={activeSession?.callsActiveSession}
      // disconnectCall={CallDisconnect}
    >
      {state =>
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
