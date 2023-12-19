import React, { useState } from 'react';
import SipProvider from '../components/SipProvider';

import IncomingCallContainer from './IncomingCall';
import WidgetContainer from './Widget';
import { CALL_DIRECTION_INCOMING } from '../lib/enums';
import { queries } from '../graphql';
import { useQuery, gql } from '@apollo/client';

import { ModalTrigger } from '@erxes/ui/src/components';
import { Alert } from '@erxes/ui/src/utils';
import CallIntegrationForm from '../components/Form';

const SipProviderContainer = props => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:call_integrations'))
  );

  const { data, loading, error } = useQuery(
    gql(queries.callIntegrationsOfUser)
  );

  if (loading) {
    return null;
  }

  if (error) {
    return Alert.error(error.message);
  }
  const { callIntegrationsOfUser } = data;

  if (!callIntegrationsOfUser || callIntegrationsOfUser.length === 0) {
    return null;
  }

  const handleSetConfig = data => {
    setConfig(data);
  };

  const content = props => (
    <CallIntegrationForm
      {...props}
      data={callIntegrationsOfUser}
      setConfig={handleSetConfig}
    />
  );

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
      />
    );
  }

  const defaultIntegration = config || callIntegrationsOfUser?.[0];

  const { wsServer, operators } = defaultIntegration || {};
  const [host, port] = wsServer?.split(':');

  const operator = operators?.[0];
  const { gsUsername, gsPassword } = operator || {};

  const sipConfig = {
    host: host,
    pathname: '/ws',
    user: gsUsername,
    password: gsPassword,
    autoRegister: true,
    port: parseInt(port?.toString() || '8089')
  };

  return (
    <SipProvider {...sipConfig}>
      {state =>
        state.callDirection === CALL_DIRECTION_INCOMING ? (
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

export default SipProviderContainer;
