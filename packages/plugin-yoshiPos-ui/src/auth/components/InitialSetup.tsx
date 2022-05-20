import { FormControl, FormGroup } from '../..//common/components/form';
import Button from '../..//common/components/Button';
import { __ } from '../..//common/utils';
import React from 'react';
import { AuthBox } from '../styles';

type Props = {
  fetchConfigs: (token: string) => void;
};

export const Description = () => {
  return (
    <>
      <h1>{__('Welcome to erxes POS')}</h1>
      <h2>{__('Erxes is the partner your website needs for success')}</h2>
      <p>{__('Here you will connect the POS system to erxes')}</p>
    </>
  );
};

const OwnerSetup = (props: Props) => {
  const { fetchConfigs } = props;
  const [token, setToken] = React.useState('');

  const handleSubmit = e => {
    e.preventDefault();

    fetchConfigs(token);
  };

  const handleToken = e => {
    e.preventDefault();

    setToken(e.target.value);
  };

  return (
    <AuthBox>
      <h2>{__('Initial Configuration')}</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormControl
            placeholder="Erxes POS token"
            type="text"
            name="token"
            onChange={handleToken}
            required={true}
          />
        </FormGroup>
        <Button btnStyle="success" type="submit" block={true}>
          Fetch configs
        </Button>
      </form>
    </AuthBox>
  );
};

export default OwnerSetup;
