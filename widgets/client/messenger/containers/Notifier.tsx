import gql from 'graphql-tag';
import * as React from 'react';
import { IBrowserInfo } from '../../types';
import DumbNotifier from '../components/Notifier';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { useAppContext } from './AppContext';
import { useQuery } from '@apollo/react-hooks';

type Props = {
  browserInfo?: IBrowserInfo;
};

const Notifier = ({ browserInfo }: Props) => {
  const { readConversation, toggleNotifierFull, toggleNotifier } =
    useAppContext();

  const { data: engageMessageQuery, loading } = useQuery(
    gql(graphqlTypes.getEngageMessage),
    {
      skip: !connection.data.customerId || !connection.enabledServices?.engage, // it should be "engages"
      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        browserInfo: browserInfo,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      // every minute
      pollInterval: 60000,
    }
  );

  const showUnreadMessage = () => {
    if (message._id) {
      const engageData = message.engageData;

      if (engageData && engageData.sentAs === 'fullMessage') {
        toggleNotifierFull();
      } else {
        toggleNotifier();
      }
    }
  };

  if (loading) {
    return null;
  }
  const message = engageMessageQuery.widgetsGetEngageMessage;

  if (!message || !message._id) {
    return null;
  }
  return (
    <DumbNotifier
      message={message}
      readConversation={readConversation}
      showUnreadMessage={showUnreadMessage}
      toggleNotifier={toggleNotifier}
    />
  );
};

export default Notifier;
