import WithPermission from 'coreui/withPermission';
import Button from '@erxes/ui/src/components/Button';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Toggle from '@erxes/ui/src/components/Toggle';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import { Block, BlockRow } from '../../../../styles';
import { getCurrencySymbol } from '../../../../utils';
import TransactionForm from '../../transactions/containers/Form';
import Transactions from '../../transactions/containers/List';
import { IKhanbankAccount } from '../types';

type Props = {
  queryParams: any;
  account: IKhanbankAccount;
} & IRouterProps;

const Detail = (props: Props) => {
  const { account, queryParams } = props;
  const accountNumber = queryParams.account;

  const defaultAccount = JSON.parse(
    localStorage.getItem('khanbankDefaultAccount') || '{}'
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
      return localStorage.removeItem('khanbankDefaultAccount');
    }

    localStorage.setItem(
      'khanbankDefaultAccount',
      JSON.stringify({ accountNumber, configId: queryParams._id })
    );
  };

  const transactionTrigger = (
    <Button btnStyle="simple" size="small" icon="money-insert">
      {__('Transfer')}
    </Button>
  );

  const transactionFormContent = modalProps => (
    <TransactionForm
      {...modalProps}
      configId={queryParams._id}
      accountNumber={queryParams.account}
    />
  );

  const renderAccount = () => {
    const holderInfo = `${account.holderInfo.custFirstName || ''} ${account
      .holderInfo.custLastName || ''}`;

    return (
      <Block>
        <h4>{__('Account detail')}</h4>
        <BlockRow>
          <FormGroup>
            <p>{__('Account')}</p>
            <strong>{accountNumber}</strong>
          </FormGroup>

          <FormGroup>
            <p>{__('Account holder')} </p>
            <strong>{holderInfo}</strong>
          </FormGroup>

          <FormGroup>
            <p>{__('Balance')} </p>
            <strong>
              {account.balance.toLocaleString()}{' '}
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

          <WithPermission action="khanbankTransfer">
            <FormGroup>
              <ModalTrigger
                size="lg"
                title="Transfer"
                autoOpenKey="showAppAddModal"
                trigger={transactionTrigger}
                content={transactionFormContent}
              />
            </FormGroup>
          </WithPermission>
        </BlockRow>
      </Block>
    );
  };

  const renderStatements = () => {
    return (
      <Block>
        <h4>{__('Latest transactions')}</h4>
        <Transactions {...props} showLatest={true} />
      </Block>
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
