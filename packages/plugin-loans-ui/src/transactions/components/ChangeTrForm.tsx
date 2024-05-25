import {
  Alert,
  Button,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  __
} from '@erxes/ui/src';
import { ChangeAmount, ExtraDebtSection } from '../../contracts/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITransaction, ITransactionDoc } from '../types';
import React, { useState } from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const { transaction = {} as ITransaction } = props;

  const [total, setTotal] = useState(transaction.total || 0);
  const [payment, setPayment] = useState(transaction.payment || 0);
  const [interestEve, setInterestEve] = useState(transaction.interestEve || 0);
  const [interestNonce, setInterestNonce] = useState(
    transaction.interestNonce || 0
  );
  const [loss, setLoss] = useState(transaction.loss || 0);
  const [insurance, setInsurance] = useState(transaction.insurance || 0);
  const [debt, setDebt] = useState(transaction.debt || 0);
  const [futureDebt, setFutureDebt] = useState(transaction.futureDebt || 0);
  const [debtTenor, setDebtTenor] = useState(transaction.debtTenor || 0);

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      payment: Number(payment || 0),
      interestEve: Number(interestEve || 0),
      interestNonce: Number(interestNonce || 0),
      loss: Number(loss || 0),
      insurance: Number(insurance || 0),
      debt: Number(debt || 0),
      futureDebt: Number(futureDebt || 0),
      debtTenor: Number(debtTenor || 0)
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const checkValid = () => {
    const total =
      Number(payment) +
      Number(interestEve) +
      Number(interestNonce) +
      Number(loss) +
      Number(insurance) +
      Number(debt);

    if (futureDebt && !debtTenor) {
      return `must fill debt Tenor when Future debt`;
    }

    return '';
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    let value = Number((e.target as HTMLInputElement).value);

    if (value < 0) {
      value = 0;
    }

    switch (name) {
      case 'total':
        setTotal(value);
        break;
      case 'payment':
        setPayment(value);
        break;
      case 'interestEve':
        setInterestEve(value);
        break;
      case 'interestNonce':
        setInterestNonce(value);
        break;
      case 'loss':
        setLoss(value);
        break;
      case 'insurance':
        setInsurance(value);
        break;
      case 'futureDebt':
        setFutureDebt(value);
        break;
      case 'debt':
        setDebt(value);
        break;
      default:
        setDebtTenor(value);
        break;
    }

    setTimeout(() => {
      const validErr = checkValid();
      if (validErr) {
        Alert.error(validErr);
      }

      const total =
        Number(payment) +
        Number(interestEve) +
        Number(interestNonce) +
        Number(loss) +
        Number(insurance) +
        Number(debt);

      setTotal(total);

      if (!futureDebt) {
        setDebtTenor(0);
      }
    }, 300);
  };

  const renderRow = (formProps: IFormProps, label, fieldName, val) => {
    const trCalcedInfo = transaction.calcedInfo;
    const trCalcedVal = trCalcedInfo[fieldName] || 0;
    const trVal = transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{`${label}`}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(trCalcedVal).toLocaleString()}</ChangeAmount>
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
        <FormColumn>
          <ChangeAmount>
            {Number(trCalcedVal - val).toLocaleString()}
          </ChangeAmount>
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
        {renderRow(formProps, 'total', 'total', total)}
        {renderRow(formProps, 'payment', 'payment', payment)}
        {renderRow(formProps, 'interest eve', 'interestEve', interestEve)}
        {renderRow(formProps, 'interest nonce', 'interestNonce', interestNonce)}
        {renderRow(formProps, 'loss', 'loss', loss)}
        {renderRow(formProps, 'insurance', 'insurance', insurance)}
        {renderRow(formProps, 'debt', 'debt', debt)}
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
          <FormColumn>
            <ChangeAmount>
              {Number(transaction.futureDebt).toLocaleString()}
            </ChangeAmount>
          </FormColumn>
          <FormColumn>
            <FormControl
              type={'number'}
              name={'futureDebt'}
              min={0}
              value={futureDebt}
              onChange={onChangeField}
              onClick={onFieldClick}
            />
          </FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Debt tenor`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
          <FormColumn>
            <ChangeAmount>
              {Number(transaction.debtTenor).toLocaleString()}
            </ChangeAmount>
          </FormColumn>
          <FormColumn>
            <FormControl
              type={'number'}
              name={'debtTenor'}
              min={1}
              value={Math.round(debtTenor)}
              onChange={onChangeField}
              onClick={onFieldClick}
            />
          </FormColumn>
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
            disableLoading: Boolean(checkValid())
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
