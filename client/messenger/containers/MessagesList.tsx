import * as React from "react";
import { MessagesList } from "../components";
import { IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
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
          isLoggedIn
        }) => {
          return (
            <MessagesList
              {...this.props}
              uiOptions={getUiOptions()}
              messengerData={getMessengerData()}
              saveGetNotified={saveGetNotified}
              getColor={getColor()}
              isLoggedIn={isLoggedIn}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
