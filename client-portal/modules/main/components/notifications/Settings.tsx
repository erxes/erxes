import React from 'react';
import { ToggleButton } from 'react-bootstrap';

import Button from '../../../common/Button';
import { FormWrapper } from '../../../styles/main';
import { IUser } from '../../../types';

type Props = {
  currentUser: IUser;
  onSave: (doc: { [key: string]: any }) => void;
};

export default function Settings(props: Props) {
  const { currentUser } = props;
  const notificationSettings  = currentUser.notificationSettings || {
    receiveByEmail: false,
    receiveBySms: false,
  };

  const [receiveByEmail, setReceiveByEmail] = React.useState(
    notificationSettings.receiveByEmail
  );
  const [receiveBySms, setreceiveBySms] = React.useState(
    notificationSettings.receiveBySms
  );

  const onSave = () => {
    props.onSave({
      receiveByEmail,
      receiveBySms,
    });
  };

  return (
    <FormWrapper>
      <h4>{'Notification settings'}</h4>
      <div className="content">
        <ToggleButton
          id="toggle-check"
          type="checkbox"
          variant="outline-primary"
          checked={receiveByEmail}
          value="1"
          onChange={(e) => setReceiveByEmail(e.currentTarget.checked)}
          color="white"
        >
          {'  Receive by mail'}
        </ToggleButton>

        <br />

        <ToggleButton
          id="toggle-check"
          type="checkbox"
          variant="outline-primary"
          checked={receiveBySms}
          value="1"
          onChange={(e) => setreceiveBySms(e.currentTarget.checked)}
          color="white"
        >
          {'  Receive by SMS'}
        </ToggleButton>

        <div className="right">
          <Button
            btnStyle="success"
            onClick={onSave}
            uppercase={false}
            icon="check-circle"
          >
            Save
          </Button>
        </div>
      </div>
    </FormWrapper>
  );
}
