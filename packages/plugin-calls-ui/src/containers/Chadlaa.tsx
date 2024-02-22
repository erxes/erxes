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
import ReactDOM from 'react-dom';

const ChadlaaContainer = (props) => {
  const [config, setConfig] = useState(
    JSON.parse(localStorage.getItem('config:call_integrations')),
  );
  const handleSetConfig = (item) => {
    if (item) {
      setConfig(item);
    }
  };
  const { data, loading, error } = useQuery(
    gql(queries.callIntegrationsOfUser),
  );

  if (loading) {
    return null;
  }

  const { callIntegrationsOfUser = [] } = data || ({} as any);
  console.log('hereeee', data);
  if (!callIntegrationsOfUser || callIntegrationsOfUser.length === 0) {
    return null;
  }
  return (
    <WidgetContainer
      {...props}
      callIntegrationsOfUser={{}}
      setConfig={handleSetConfig}
    />
  );
};

export default ChadlaaContainer;
