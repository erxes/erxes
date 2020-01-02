import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { IIntegrationUiOptions } from "../../types";
import { Launcher as DumpLauncher } from "../components";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type BaseProps = {
  isMessengerVisible: boolean;
  isBrowserInfoSaved: boolean;
  onClick: (isVisible?: boolean) => void;
  uiOptions: IIntegrationUiOptions;
  lastUnreadMessage?: IMessage;
};

type QueryResponse = {
  widgetsTotalUnreadCount: number;
};

type Props = ChildProps<BaseProps, QueryResponse>;

class Launcher extends React.Component<Props, {}> {
  componentDidMount() {
    const { data } = this.props;

    if (data) {
      data.subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: () => {
          data.refetch();
        }
      });
    }
  }

  render() {
    const { data } = this.props;

    let totalUnreadCount = 0;

    if (data && data.widgetsTotalUnreadCount) {
      totalUnreadCount = data.widgetsTotalUnreadCount;
    }

    return <DumpLauncher {...this.props} totalUnreadCount={totalUnreadCount} />;
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
      getUiOptions
    }) => {
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
