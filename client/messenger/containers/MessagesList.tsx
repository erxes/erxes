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
        {({ getUiOptions, getMessengerData, updateCustomer }) => {
          return (
            <MessagesList
              {...this.props}
              updateCustomer={updateCustomer}
              uiOptions={getUiOptions()}
              messengerData={getMessengerData()}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
