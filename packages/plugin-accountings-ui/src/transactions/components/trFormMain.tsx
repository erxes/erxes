import FormGroup from '@erxes/ui/src/components/form/Group';
import {
  Actions, FormColumn,
  FormWrapper, InfoWrapper, ModalFooter, PopoverButton, PopoverHeader
} from "@erxes/ui/src/styles/main";
import {
  __,
} from '@erxes/ui/src';
import { IQueryParams } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { ITransaction } from '../types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectAccount from '../../settings/accounts/containers/SelectAccount';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  transactions?: ITransaction[];
  queryParams: IQueryParams;
};

const TrFormMain = (props: Props) => {
  return (
    <>
      <ControlLabel>{__('MainForm')}</ControlLabel>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Account')}</ControlLabel>
            <SelectAccount
              multi={false}
              label='Account'
              name='account'
              filterParams={{ journals: ['main'] }}
              onSelect={(accountId) => { }}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Number')}</ControlLabel>
            <FormControl
              name="number"
              value={''}
              autoFocus={true}
              required={true}
              onChange={e => { }}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    </>
  );
};

export default TrFormMain;
