import { formatValue, FormControl, Icon, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';
import { TrNumberCols, TrRows } from '../../contracts/styles';
import TransactionForm from '../containers/TransactionForm';
import { ITransaction } from '../types';
import { __ } from 'coreui/utils';
import EBarimtForm from './EBarimtForm';
type Props = {
  transaction: ITransaction;
  history: any;
  isChecked: boolean;
  toggleBulk: (transaction: ITransaction, isChecked?: boolean) => void;
};

function displayValue(transaction, name) {
  const value = _.get(transaction, name);
  return formatValue(value);
}

function displayNumber(transaction, name) {
  const value = _.get(transaction, name);
  return Number(String((value || 0).toFixed(2))).toLocaleString();
}

function TransactionRow({
  transaction,
  history,
  isChecked,
  toggleBulk,
}: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(transaction, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const renderEBarimtBtn = (isGotEBarimt: boolean) => {
    if (!transaction.calcedInfo || !transaction.contractId) {
      return null;
    }

    const ebarimtForm = (props) => (
      <EBarimtForm
        {...props}
        transaction={transaction}
        isGotEBarimt={isGotEBarimt}
      />
    );
    return (
      <>
        <ModalTrigger
          title="EBarimt info"
          trigger={
            isGotEBarimt ? <Icon icon="print" /> : <Icon icon="invoice" />
          }
          size="lg"
          content={ebarimtForm}
        />
        &nbsp; &nbsp;
      </>
    );
  };

  return (
    <TrRows>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'number'}>
        {(transaction && transaction.contract && transaction.contract.number) ||
          ''}{' '}
      </td>
      <td key={'description'}>{transaction.description || ''} </td>
      <td key={'payDate'}>{displayValue(transaction, 'payDate')}</td>
      <TrNumberCols key={'payment'}>
        {displayNumber(transaction, 'payment')}
      </TrNumberCols>
      <TrNumberCols key={'storedInterest'}>
        {displayNumber(transaction, 'storedInterest')}
      </TrNumberCols>
      <TrNumberCols key={'calcInterest'}>
        {displayNumber(transaction, 'calcInterest')}
      </TrNumberCols>
      <TrNumberCols key={'undue'}>
        {displayNumber(transaction, 'undue')}
      </TrNumberCols>
      <TrNumberCols key={'insurance'}>
        {displayNumber(transaction, 'insurance')}
      </TrNumberCols>
      <TrNumberCols key={'total'}>
        {displayNumber(transaction, 'total')}
      </TrNumberCols>
      <td key={'manage'}>{renderEBarimtBtn(!!transaction.ebarimt)}</td>
    </TrRows>
  );
}

export default TransactionRow;
