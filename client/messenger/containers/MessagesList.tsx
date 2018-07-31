import * as React from "react";
import { MessagesList } from "../components";
import { IMessage } from "../types";
import { AppConsumer } from "./AppContext";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
};

export default class extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ getUiOptions, getMessengerData }) => {
          return (
            <MessagesList
              {...this.props}
              uiOptions={getUiOptions()}
              messengerData={getMessengerData()}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
