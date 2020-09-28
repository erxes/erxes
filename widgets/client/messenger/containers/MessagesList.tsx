import * as React from "react";
import { MessagesList } from "../components";
import { IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
  toggleVideoCall: () => void;
};

export default class extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({
          getUiOptions,
          getMessengerData,
          saveGetNotified,
          getColor,
          isLoggedIn,
          sendMessage,
          sendTypingInfo,
          replyAutoAnswer,
          botTyping
        }) => {
          return (
            <MessagesList
              {...this.props}
              botTyping={botTyping}
              uiOptions={getUiOptions()}
              messengerData={getMessengerData()}
              saveGetNotified={saveGetNotified}
              getColor={getColor()}
              isLoggedIn={isLoggedIn}
              sendTypingInfo={sendTypingInfo}
              replyAutoAnswer={replyAutoAnswer}
              sendMessage={sendMessage}
              showVideoCallRequest={
                this.props.isOnline && getMessengerData().showVideoCallRequest
              }
            />
          );
        }}
      </AppConsumer>
    );
  }
}
