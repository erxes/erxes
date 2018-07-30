import * as React from 'react';
import { graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { connection } from '../connection';
import { Launcher as DumpLauncher } from '../components';
import graphqlTypes from '../graphql';
import { AppConsumer } from './AppContext';
import { IMessage, IIntegrationUiOptions } from '../types';

type BaseProps = {
  isMessengerVisible: boolean,
  isBrowserInfoSaved: boolean,
  onClick: (isVisible?: boolean) => void,
  uiOptions: IIntegrationUiOptions,
  lastUnreadMessage?: IMessage,
}

type QueryResponse = {
  totalUnreadCount: number,
}

type Props = ChildProps<BaseProps, QueryResponse>;

class Launcher extends React.Component<Props, {}> {
  componentWillReceiveProps(nextProps: Props) {
    const data = this.props.data;
    const nextData = nextProps.data;

    if (!data && nextData) {
      nextData.subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: () => {
          nextData.refetch();
        }
      });
    }
  }

  render() {
    const { data } = this.props;

    let totalUnreadCount = 0;

    if (data && data.totalUnreadCount) {
      totalUnreadCount = data.totalUnreadCount;
    }

    return <DumpLauncher {...this.props} totalUnreadCount={totalUnreadCount} />
  }
}

const WithQuery = graphql<Props, QueryResponse>(
  gql(graphqlTypes.totalUnreadCountQuery),
  {
    options: () => ({
      variables: connection.data,
    }),
    skip: (props) => !props.isMessengerVisible
  }
)(Launcher);

const container = () => (
  <AppConsumer>
    {({ isMessengerVisible, isBrowserInfoSaved, lastUnreadMessage, toggle, getUiOptions }) => {
      return (
        <WithQuery
          isMessengerVisible={isMessengerVisible}
          isBrowserInfoSaved={isBrowserInfoSaved}
          onClick={toggle}
          uiOptions={getUiOptions()}
          lastUnreadMessage={lastUnreadMessage}
        />
      );
    }}
  </AppConsumer>
);

export default container;