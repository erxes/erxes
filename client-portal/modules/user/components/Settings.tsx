import { SettingsContent, SettingsTitle } from "../../styles/profile";

import Button from "../../common/Button";
import { ControlLabel } from "../../common/form";
import { IUser } from "../../types";
import { ModalFooter } from "../../common/form/styles";
import { NotificationSettingsRow } from "../../styles/notifications";
import React from "react";
import Toggle from "react-toggle";

type Props = {
  currentUser: IUser;
  onSave: (doc: { [key: string]: any }) => void;
};

function Settings({ currentUser = {} as IUser, onSave }: Props) {
  const notificationSettings = currentUser
    ? currentUser.notificationSettings
    : {
        receiveByEmail: false,
        receiveBySms: false,
      };

  const [receiveByEmail, setReceiveByEmail] = React.useState(
    notificationSettings.receiveByEmail
  );
  const [receiveBySms, setreceiveBySms] = React.useState(
    notificationSettings.receiveBySms
  );

  const onClick = () => {
    onSave({
      receiveByEmail,
      receiveBySms,
    });
  };

  return (
    <>
      <SettingsTitle>User Settings</SettingsTitle>
      <SettingsContent>
        <ControlLabel>{"Notification settings"}</ControlLabel>
        <NotificationSettingsRow>
          <p>Receive notification by email</p>
          <div className="d-flex align-items-center">
            <Toggle
              defaultChecked={receiveByEmail}
              aria-label="No label tag"
              onChange={() => setReceiveByEmail(!receiveByEmail)}
            />
            {receiveByEmail ? "On" : "Off"}
          </div>
        </NotificationSettingsRow>
        <NotificationSettingsRow>
          <p>Receive notification by SMS</p>
          <div className="d-flex align-items-center">
            <Toggle
              defaultChecked={receiveBySms}
              aria-label="No label tag"
              onChange={() => setreceiveBySms(!receiveBySms)}
            />
            {receiveBySms ? "On" : "Off"}
          </div>
        </NotificationSettingsRow>
        <ModalFooter>
          <Button
            btnStyle="success"
            onClick={onClick}
            uppercase={false}
            icon="check-circle"
          >
            Save
          </Button>
        </ModalFooter>
      </SettingsContent>
    </>
  );
}

export default Settings;
