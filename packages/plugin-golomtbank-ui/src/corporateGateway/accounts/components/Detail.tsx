import Button from '@erxes/ui/src/components/Button';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import {BlockRow } from '../../../styles';
import { getCurrencySymbol } from '../../../utils';
import { IGolomtBankAccount } from '../../../types/IGolomtAccount';

type Props = {
  queryParams: any;
  account: IGolomtBankAccount;
};

const Detail = (props: Props) => {
  const { account, queryParams } = props;
  const accountNumber = queryParams.account;

  const defaultAccount = JSON.parse(
    localStorage.getItem('golomtbankDefaultAccount') || '{}'
  );

  const [isChecked, setIsChecked] = React.useState(
    defaultAccount.accountNumber === accountNumber
  );

  React.useEffect(() => {
    setIsChecked(defaultAccount.accountNumber === accountNumber);
  }, [queryParams.account]);

  const toggleChange = e => {
    setIsChecked(e.target.checked);

    if (!e.target.checked) {
      return localStorage.removeItem('golomtbankDefaultAccount');
    }

    localStorage.setItem(
      'golomtbankDefaultAccount',
      JSON.stringify({ accountNumber, configId: queryParams._id })
    );
  };

  const transactionTrigger = (
    <Button btnStyle="simple" size="small" icon="money-insert">
      {__('Transfer')}
    </Button>
  );

  const transactionFormContent = modalProps => (
    <div/>
  );

  const renderAccount = () => {

    return (
      <div>
        <h4>{__('Account detail')}</h4>
        <BlockRow>
          <FormGroup>
            <p>{__('Account')}</p>
            <strong>{accountNumber}</strong>
          </FormGroup>

          <FormGroup>
            <p>{__('Account holder')} </p>
            {/* //<strong>{holderInfo}</strong> */}
          </FormGroup>

          <FormGroup>
            <p>{__('Balance')} </p>
            <strong>
              {/* {account.balance.toLocaleString()}{' '} */}
              {getCurrencySymbol(account.currency || 'MNT')}
            </strong>
          </FormGroup>
        </BlockRow>

        <BlockRow>
          <FormGroup>
            <p>{__('Default account')}</p>
            <Toggle
              checked={isChecked}
              onChange={toggleChange}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>

          
            <FormGroup>
              <ModalTrigger
                size="lg"
                title="Transfer"
                autoOpenKey="showAppAddModal"
                trigger={transactionTrigger}
                content={transactionFormContent}
              />
            </FormGroup>
        </BlockRow>
      </div>
    );
  };

  const renderStatements = () => {
    return (
      <div>
        <h4>{__('Latest transactions')}</h4>
       
      </div>
    );
  };

  return (
    <>
      {renderAccount()}
      {renderStatements()}
    </>
  );
};

export default Detail;
