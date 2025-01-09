import React, { useState } from 'react';
import {
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  closeModal: () => void;
  save: (username: string, userpass: string) => void;
};

const CheckForm = ({ save, closeModal }: Props) => {
  const [userName, setUserName] = useState<string>('');
  const [userPass, setUserPass] = useState<string>('');

  const onChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const onChangeUserCode = (e) => {
    setUserPass(e.target.value);
  };

  const handleSubmit = () => {
    save(userName, userPass);
  };
  const renderContent = () => {
    return (
      <>
        <FormGroup>
          <ControlLabel>{'user name'}</ControlLabel>
          <FormControl value={userName} onChange={onChangeUserName} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{'user code'}</ControlLabel>
          <FormControl
            type={'password'}
            value={userPass}
            onChange={onChangeUserCode}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          <Button type="submit" btnStyle="success" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} onSubmit={handleSubmit} />;
};

export default CheckForm;
