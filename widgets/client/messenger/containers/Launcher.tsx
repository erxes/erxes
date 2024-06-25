import gql from 'graphql-tag';
import * as React from 'react';
import { ChildProps } from 'react-apollo';
import { IBrowserInfo, IIntegrationUiOptions } from '../../types';
import DumpLauncher from '../components/Launcher';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { IMessage } from '../types';
import { useAppContext } from './AppContext';
import { useQuery } from '@apollo/react-hooks';

type BaseProps = {
  isMessengerVisible: boolean;
  isBrowserInfoSaved: boolean;
  onClick: (isVisible?: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  uiOptions: IIntegrationUiOptions;
  lastUnreadMessage?: IMessage;
  browserInfo: IBrowserInfo;
};

type QueryResponse = {
  widgetsTotalUnreadCount: number;
};

type Props = ChildProps<BaseProps, QueryResponse>;

const Launcher = () => {
  const {
    isMessengerVisible,
    isBrowserInfoSaved,
    lastUnreadMessage,
    toggle,
    unreadCount,
    setUnreadCount,
    getUiOptions,
    browserInfo,
  } = useAppContext();

  const { data, subscribeToMore, loading } = useQuery(
    gql(graphqlTypes.totalUnreadCountQuery),
    {
      variables: connection.data,
    }
  );

  React.useEffect(() => {
    if (data) {
      subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: (prev, { subscriptionData }) => {
          setUnreadCount(
            subscriptionData.data.conversationAdminMessageInserted.unreadCount
          );
        },
      });
    }
  }, [data, subscribeToMore]);

  React.useEffect(() => {
    if (data && loading === false) {
      setUnreadCount(data.widgetsTotalUnreadCount || 0);
    }
  }, [data, setUnreadCount]);

  return (
    <DumpLauncher
      onClick={toggle}
      isMessengerVisible={isMessengerVisible}
      isBrowserInfoSaved={isBrowserInfoSaved}
      uiOptions={getUiOptions()}
      browserInfo={browserInfo}
      totalUnreadCount={unreadCount}
    />
  );
};

export default Launcher;
