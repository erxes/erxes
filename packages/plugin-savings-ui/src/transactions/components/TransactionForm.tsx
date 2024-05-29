import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  Info,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITransaction, ITransactionDoc } from '../types';

import { Amount } from '../../contracts/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import SelectContracts, {
  Contracts
} from '../../contracts/components/common/SelectContract';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  closeModal: () => void;
  type: string;
};

const TransactionForm = (props: Props) => {
  const { transaction = {} as ITransaction, type } = props;
  const [contractId, setContractId] = useState(transaction.contractId || '');
  const [payDate, setPayDate] = useState(transaction.payDate || new Date());
  const [description, setDescription] = useState(transaction.description || '');
  const [total, setTotal] = useState(transaction.total || 0);
  const [companyId, setCompanyId] = useState(transaction.companyId || '');
  const [customerId, setCustomerId] = useState(transaction.customerId || '');
  const [storedInterest, setStoredInterest] = useState(
    transaction.storedInterest || 0
  );
  const [closeInterestRate, setCloseInterestRate] = useState(
    transaction.closeInterestRate || 0
  );
  const [closeInterest, setCloseInterest] = useState(
    transaction.closeInterest || 0
  );
  const [interestRate, setInterestRate] = useState(
    transaction.interestRate || 0
  );
  const [savingAmount, setSavingAmount] = useState(
    transaction.savingAmount || 0
  );

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      contractId,
      description,
      companyId,
      customerId,
      storedInterest,
      transactionType: type,
      closeInterestRate,
      closeInterest,
      interestRate,
      savingAmount,
      isManual: true,
      payDate: finalValues.payDate,
      total: Number(total)
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const renderRowTr = (label, fieldName) => {
    let trVal =
      fieldName === 'savingAmount'
        ? savingAmount
        : fieldName === 'storedInterest'
          ? storedInterest
          : closeInterest;

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${__(label)}:`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      setContractId(value);
    };

    const onChangePayDate = (value) => {
      setPayDate(value);
    };

    const onChangeField = (e) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
      if ((e.target as HTMLInputElement).name === 'total') {
        setTotal(value as any);
      }
      if ((e.target as HTMLInputElement).name === 'description') {
        setDescription(value as any);
      }
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Pay Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="payDate"
                    dateFormat="YYYY/MM/DD"
                    value={payDate}
                    onChange={onChangePayDate}
                  />
                </DateContainer>
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Contract')}</ControlLabel>
                <SelectContracts
                  label={__('Choose an contract')}
                  name="contractId"
                  initialValue={contractId}
                  onSelect={(v, n) => {
                    onSelect(v, n);
                    if (typeof v === 'string') {
                      if (Contracts[v].customerType === 'company') {
                        setCompanyId(Contracts[v].customerId);
                      } else {
                        setCustomerId(Contracts[v].customerId);
                      }

                      setStoredInterest(Contracts[v].storedInterest);
                      setCloseInterestRate(Contracts[v].closeInterestRate);
                      setInterestRate(Contracts[v].interestRate);
                      setSavingAmount(Contracts[v].savingAmount);
                      setCloseInterest(
                        Number(
                          (
                            ((Contracts[v].savingAmount *
                              Contracts[v].closeInterestRate) /
                              100 /
                              365) *
                            dayjs().diff(dayjs(Contracts[v].startDate), 'day')
                          ).toFixed(2)
                        )
                      );
                    }
                  }}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Total')}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={'number'}
                  useNumberFormat
                  fixed={2}
                  name="total"
                  value={total}
                  onChange={onChangeField}
                  onClick={onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Description')}</ControlLabel>
                <DateContainer>
                  <FormControl
                    {...formProps}
                    required={false}
                    name="description"
                    value={description}
                    onChange={onChangeField}
                  />
                </DateContainer>
              </FormGroup>
              {type === 'outcome' && (
                <Info type="danger" title="Анхаар">
                  Зарлага хийх үед хүүгийн буцаалт хийгдэж гэрээ цуцлагдахыг
                  анхаарна уу
                </Info>
              )}
              {type === 'outcome' &&
                renderRowTr('Saving Amount', 'savingAmount')}
              {type === 'outcome' &&
                renderRowTr('Saving stored interest', 'storedInterest')}
              {type === 'outcome' &&
                renderRowTr('Close interest Rate', 'closeInterest')}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'transaction',
            values: generateDoc(values),
            isSubmitted,
            object: props.transaction
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
