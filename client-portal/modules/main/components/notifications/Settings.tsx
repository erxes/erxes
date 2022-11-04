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

  const [receiveByEmail, setReceiveByEmail] = React.useState(
    currentUser.notificationSettings.receiveByEmail
  );
  const [receiveBySMS, setReceiveBySMS] = React.useState(
    currentUser.notificationSettings.receiveBySMS
  );

  const onSave = () => {
    props.onSave({
      receiveByEmail,
      receiveBySMS,
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
          checked={receiveBySMS}
          value="1"
          onChange={(e) => setReceiveBySMS(e.currentTarget.checked)}
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
