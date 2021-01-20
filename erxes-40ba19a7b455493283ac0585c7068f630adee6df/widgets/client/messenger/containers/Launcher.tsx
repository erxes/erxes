import gql from 'graphql-tag';
import * as React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import { IBrowserInfo, IIntegrationUiOptions } from '../../types';
import { Launcher as DumpLauncher } from '../components';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { IMessage } from '../types';
import { AppConsumer } from './AppContext';

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

class Launcher extends React.Component<Props, {}> {
  componentDidMount() {
    const { data, setUnreadCount } = this.props;

    if (data) {
      data.subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: (prev, { subscriptionData }) => {
          setUnreadCount(
            subscriptionData.data.conversationAdminMessageInserted.unreadCount
          );
        }
      });
    }
  }

  componentDidUpdate({ data }: Props) {
    const cData = this.props.data;

    if (data && data.loading && cData && !cData.loading) {
      this.props.setUnreadCount(cData.widgetsTotalUnreadCount || 0);
    }
  }

  render() {
    const { unreadCount } = this.props;

    return <DumpLauncher {...this.props} totalUnreadCount={unreadCount} />;
  }
}

const WithQuery = graphql<Props, QueryResponse>(
  gql(graphqlTypes.totalUnreadCountQuery),
  {
    options: () => ({
      variables: connection.data
    })
  }
)(Launcher);

const container = () => (
  <AppConsumer>
    {({
      isMessengerVisible,
      isBrowserInfoSaved,
      lastUnreadMessage,
      toggle,
      unreadCount,
      setUnreadCount,
      getUiOptions,
      browserInfo
    }) => {
      return (
        <WithQuery
          isMessengerVisible={isMessengerVisible}
          isBrowserInfoSaved={isBrowserInfoSaved}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          onClick={toggle}
          uiOptions={getUiOptions()}
          lastUnreadMessage={lastUnreadMessage}
          browserInfo={browserInfo}
        />
      );
    }}
  </AppConsumer>
);

export default container;
