import {
  formatValue,
  FormControl,
  Icon,
  ModalTrigger,
  Tip
} from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';
import { TrNumberCols, TrRows } from '../../contracts/styles';
import ChangeTrForm from '../containers/ChangeTrForm';
import TransactionForm from '../containers/TransactionForm';
import { ITransaction } from '../types';
import { __ } from 'coreui/utils';
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
  toggleBulk
}: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(transaction, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const renderChangeBtn = () => {
    if (!transaction.contractId) {
      return null;
    }

    const trAmountForm = props => (
      <ChangeTrForm {...props} transaction={transaction} />
    );
    return (
      <>
        <ModalTrigger
          title="Edit amounts info"
          trigger={
            <Tip text="Calculator" placement="left">
              <Icon icon="calcualtor" />
            </Tip>
          }
          size="lg"
          content={trAmountForm}
        />
        &nbsp; &nbsp;
      </>
    );
  };

  const renderEditBrn = () => {
    const trBaseForm = props => (
      <TransactionForm {...props} transaction={transaction} />
    );

    return (
      <ModalTrigger
        title={__('Edit basic info')}
        trigger={
          <Tip text="Edit" placement="left">
            <Icon icon="edit" />
          </Tip>
        }
        size="lg"
        content={trBaseForm}
      />
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
      <TrNumberCols key={'total'}>
        {displayNumber(transaction, 'total')}
      </TrNumberCols>
      <TrNumberCols key={'total'}>{transaction.transactionType}</TrNumberCols>
      <td key={'manage'}>
        {renderChangeBtn()}
        {renderEditBrn()}
      </td>
    </TrRows>
  );
}

export default TransactionRow;
