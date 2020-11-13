import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Info from 'modules/common/components/Info';
import { Alert } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';

const ActivateInstallation = () => {
  const options: any = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  };

  const [token, setToken] = useState('');
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    fetch('https://erxes.io/check-activate-installation', options).then(
      response => {
        if (response.ok) {
          setActivated(true);
        }
      }
    );
  }, [options]);

  const onSubmit = e => {
    e.preventDefault();

    options.body = JSON.stringify({
      token
    });

    fetch('https://erxes.io/activate-installation', options).then(
      async response => {
        const jsonRes = await response.json();

        if (!response.ok) {
          return Alert.error(jsonRes.message);
        }

        setActivated(true);

        return Alert.success(jsonRes.message);
      }
    );
  };

  const onChange = e => {
    setToken(e.target.value);
  };

  if (activated) {
    return <Info>Already activated</Info>;
  }

  return (
    <form onSubmit={onSubmit}>
      <FormGroup>
        <ControlLabel required={true}>Token</ControlLabel>

        <FormControl
          onChange={onChange}
          value={token}
          name="token"
          required={true}
          autoFocus={true}
        />
      </FormGroup>
      <Button
        uppercase={false}
        btnStyle="success"
        type="submit"
        icon="check-circle"
      >
        Activate
      </Button>
    </form>
  );
};

export default ActivateInstallation;
