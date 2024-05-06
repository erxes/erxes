import {
  __,
  Alert,
  Button,
  ControlLabel,
  Form,
  FormControl,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import { ChangeAmount, ExtraDebtSection } from '../../contracts/styles';
import { ITransaction, ITransactionDoc } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const { transaction } = props;
  const [total, setTotal] = useState(transaction.total || 0);
  const [payment, setPayment] = useState(transaction.payment || 0);
  const [maxTotal, setMaxTotal] = useState(Math.max(transaction.total || 0));
  const [firstTotal, setFirstTotal] = useState(
    (transaction.total || 0) - (transaction.futureDebt || 0),
  );

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      payment: Number(payment || 0),
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const checkValid = () => {
    const total = Number(payment);

    if (total > maxTotal) {
      return `Overdue total: Max total is ${maxTotal}`;
    }

    if (total < firstTotal) {
      return `Missing first Total: first Total total is ${firstTotal}`;
    }

    return '';
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    let value = Number((e.target as HTMLInputElement).value);

    if (value < 0) {
      value = 0;
    }

    if (name === 'total') {
      setTotal(value as any);
    }
    if (name === 'payment') {
      setPayment(value as any);
    }

    setTimeout(() => {
      const validErr = checkValid();
      if (validErr) {
        Alert.error(validErr);
      }

      const total = Number(payment);

      setTotal(total);
    }, 300);
  };

  const renderRow = (formProps: IFormProps, label, fieldName) => {
    const trVal = transaction[fieldName] || 0;
    const val = fieldName === 'total' ? total : payment;

    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{`${label}`}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(trVal).toLocaleString()}</ChangeAmount>
        </FormColumn>
        <FormColumn>
          <FormControl
            {...formProps}
            type={'number'}
            name={fieldName}
            min={0}
            value={val}
            onChange={onChangeField}
            onClick={onFieldClick}
          />
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderInfo = (formProps: IFormProps) => {
    return (
      <>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Type`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`First calced`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Saved`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Change Values`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Odd`)}</ControlLabel>
          </FormColumn>
        </FormWrapper>
        {renderRow(formProps, 'total', 'total')}
        {renderRow(formProps, 'payment', 'payment')}
      </>
    );
  };

  const renderExtraDebt = () => {
    return (
      <ExtraDebtSection>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Future Debt`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Debt tenor`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
      </ExtraDebtSection>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>{renderInfo(formProps)}</FormColumn>
          </FormWrapper>
          {renderExtraDebt()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          {renderButton({
            values: generateDoc(values),
            isSubmitted,
            disableLoading: Boolean(checkValid()),
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
