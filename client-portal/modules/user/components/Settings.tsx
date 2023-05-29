import { ControlLabel, FormGroup } from "../../common/form";
import { SettingsContent, SettingsTitle } from "../../styles/profile";

import Button from "../../common/Button";
import { IUser } from "../../types";
import { ModalFooter } from "../../common/form/styles";
import React from "react";
import ToggleButton from "react-bootstrap/ToggleButton";

type Props = {
  currentUser: IUser;
  onSave: (doc: { [key: string]: any }) => void;
};

function Settings({ currentUser = {} as IUser, onSave }: Props) {
  const notificationSettings = currentUser.notificationSettings || {
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
        <FormGroup horizontal={true}>
          <ToggleButton
            id="toggle-check"
            type="checkbox"
            variant="outline-primary"
            checked={receiveByEmail}
            value="1"
            onChange={(e) => setReceiveByEmail(e.currentTarget.checked)}
            color="white"
          >
            {"  Receive by mail"}
          </ToggleButton>

          <ToggleButton
            id="toggle-check"
            type="checkbox"
            variant="outline-primary"
            checked={receiveBySms}
            value="1"
            onChange={(e) => setreceiveBySms(e.currentTarget.checked)}
            color="white"
          >
            {"  Receive by SMS"}
          </ToggleButton>
        </FormGroup>
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
