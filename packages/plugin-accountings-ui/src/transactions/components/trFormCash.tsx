import FormGroup from '@erxes/ui/src/components/form/Group';
import {
  FormColumn,
  FormWrapper,
} from "@erxes/ui/src/styles/main";
import {
  __,
} from '@erxes/ui/src';
import { IQueryParams } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { ITransaction } from '../types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectAccount from '../../settings/accounts/containers/SelectAccount';

type Props = {
  transactions?: ITransaction[];
  queryParams: IQueryParams;
};

const TrFormCash = (props: Props) => {
  const {
    transactions,
  } = props;

  return (
    <FormWrapper>
      <ControlLabel required={true}>{__('CashForm')}</ControlLabel>
      <FormColumn>
        <FormGroup>
          <ControlLabel required={true}>{__('Account')}</ControlLabel>
          <SelectAccount
            multi={false}
            label='Account'
            name='account'
            filterParams={{ journals: ['cash'] }}
            onSelect={(accountId) => { }}
          />
        </FormGroup>
      </FormColumn>
    </FormWrapper>
  );
};

export default TrFormCash;
