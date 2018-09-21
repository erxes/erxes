import { Button, NameCard } from "modules/common/components";
import * as React from "react";
import { IMessageDocument } from "../../../../../types";
import { AppMessageBox, CallButton, FlexItem, UserInfo } from "../styles";

type Props = {
  message: IMessageDocument;
};

export default class AppMessage extends React.Component<Props, {}> {
  render() {
    const { messengerAppData = {} } = this.props.message;
    const customerName =
      messengerAppData.customer && messengerAppData.customer.firstName;

    return (
      <FlexItem>
        <AppMessageBox>
          <UserInfo>
            <NameCard.Avatar customer={messengerAppData.customer} size={60} />
            <h4>Meet with {customerName}</h4>
          </UserInfo>
          <CallButton>
            <h5>Meeting Ready</h5>
            <a href={messengerAppData.hangoutLink} target="_blank">
              <Button>Join Call</Button>
            </a>
          </CallButton>
        </AppMessageBox>
      </FlexItem>
    );
  }
}
