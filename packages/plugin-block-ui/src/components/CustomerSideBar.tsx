import React, { useState } from 'react';
import { __ } from 'coreui/utils';
import Box from '@erxes/ui/src/components/Box';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import Select from 'react-select-plus';
import { List } from '../styles';

type Props = {
  id: string;
  getBalance: number;
  verified: string;
  addBalance: (erxesCustomerId: string, amount: number) => void;
  updateVerify: (erxesCustomerId: string, isVerified: string) => void;
};

function CustomerSideBar({
  id,
  getBalance,
  verified,
  addBalance,
  updateVerify
}: Props) {
  const [balance, SetBalance] = useState(0);
  const [verify, SetVerify] = useState(verified);

  const onChangeBalance = e => {
    SetBalance(Number(e.target.value));
  };

  const onVerifyChange = option => {
    const value = option ? option.value : '';

    SetVerify(value);
  };

  const handleSubmitBalance = () => {
    addBalance(id, balance);
  };

  const handleSubmitVerify = () => {
    updateVerify(id, verify);
  };

  return (
    <Box title={__('Block')} name="showOthers">
      <FormGroup>
        <ControlLabel>{__('Balance')}</ControlLabel>
        <FormControl
          type="number"
          defaultValue={balance}
          onChange={onChangeBalance}
        />
      </FormGroup>
      <Button btnStyle="success" onClick={handleSubmitBalance}>
        Submit
      </Button>
      <FormGroup>
        <ControlLabel>{__('Verify')}</ControlLabel>
        <Select
          value={verify}
          onChange={onVerifyChange}
          options={[
            {
              label: 'True',
              value: 'true'
            },
            {
              label: 'False',
              value: 'false'
            },
            {
              label: 'Loading',
              value: 'loading'
            }
          ]}
          clearable={false}
        />
      </FormGroup>
      <Button btnStyle="success" onClick={handleSubmitVerify}>
        Submit
      </Button>
      <List>
        <li>
          <div>{__('Total Balance')}: </div> <span>{getBalance}</span>
        </li>
      </List>
    </Box>
  );
}

export default CustomerSideBar;
