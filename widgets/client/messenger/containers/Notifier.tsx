import gql from "graphql-tag";
import * as React from "react";
import { compose, graphql } from "react-apollo";
import { IBrowserInfo } from "../../types";
import { Notifier as DumbNotifier } from "../components";
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { EngageMessageQueryResponse ,IMessage} from "../types";
import { AppConsumer } from "./AppContext";
type Props = {
  message?: IMessage;
  browserInfo?: IBrowserInfo;
  engageMessageQuery: EngageMessageQueryResponse;
};
class Notifier extends React.Component<Props> {
  render() {
    const { engageMessageQuery} = this.props;

    const message = engageMessageQuery.widgetsGetEngageMessage;

    if (!message || !message._id) {
      return null;
    }

    return (
      <AppConsumer>
        {({ readConversation, toggleNotifierFull, toggleNotifier }) => {
          const showUnreadMessage = () => {
            if (message._id) {
              const engageData = message.engageData;

              if (engageData && engageData.sentAs === "fullMessage") {
                toggleNotifierFull();
              } else {
                toggleNotifier();
              }
            }
          };

          return (
            <DumbNotifier
              {...this.props}
              message={message}
              readConversation={readConversation}
              showUnreadMessage={showUnreadMessage}
              toggleNotifier={toggleNotifier}
            />
          );
        }}
      </AppConsumer>
    );
  }
}


const withPollInterval = compose(graphql<Props>(
  gql(graphqlTypes.getEngageMessage), {
  name: 'engageMessageQuery',
  options: ownProps => ({
    variables: {
      customerId: connection.data.customerId,
      browserInfo: ownProps.browserInfo,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    skip: !connection.data.customerId,
    // every minute
    pollInterval: 60000
  })
})
)(Notifier)


export default withPollInterval
