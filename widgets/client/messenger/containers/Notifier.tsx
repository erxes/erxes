import * as React from "react";

import { Notifier as DumbNotifier } from "../components";
import { IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  message?: IMessage;
};

export default class Notifier extends React.Component<Props> {
  render() {
    const { message } = this.props;

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
