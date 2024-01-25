import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITransaction, ITransactionDoc } from '../types';

import { Amount } from '../../contracts/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IInvoice } from '../../invoices/types';
import React, { useState } from 'react';
import { __ } from 'coreui/utils';
import SelectContracts, {
  Contracts,
} from '../../contracts/components/common/SelectContract';
import dayjs from 'dayjs';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../graphql';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  invoice?: IInvoice;
  type: string;
  closeModal: () => void;
  contractId?: string;
};

const TransactionForm = (props: Props) => {
  const { transaction = {} as ITransaction } = props;

  const [contractId, setContractId] = useState(
    props.contractId ||
      transaction.contractId ||
      (props.invoice && props.invoice.contractId) ||
      '',
  );
  const [payDate, setPayDate] = useState(
    transaction.payDate ||
      (props.invoice && props.invoice.payDate) ||
      new Date(),
  );
  const [invoiceId, setInvoiceId] = useState(
    transaction.invoiceId || (props.invoice && props.invoice._id) || '',
  );
  const [description, setDescription] = useState(transaction.description || '');
  const [total, setTotal] = useState(
    transaction.total || (props.invoice && props.invoice.total) || 0,
  );
  const [companyId, setCompanyId] = useState(
    transaction.companyId || (props.invoice && props.invoice.companyId) || '',
  );
  const [customerId, setCustomerId] = useState(
    transaction.customerId || (props.invoice && props.invoice.customerId) || '',
  );
  const [invoice, setInvoice] = useState(
    props.invoice || transaction.invoice || null,
  );
  const [paymentInfo, setPaymentInfo] = useState(null as any);
  const [isGetEBarimt, setIsGetEBarimt] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [organizationRegister, setOrganizationRegister] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [storedInterest, setStoredInterest] = useState(0);

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const { transaction, type } = props;

    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      contractId,
      invoiceId,
      description,
      companyId,
      customerId,
      invoice,
      paymentInfo,
      storedInterest,
      transactionType: type,
      isManual: true,
      payDate: finalValues.payDate,
      total: Number(total),
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const renderRow = (label, fieldName) => {
    const invoiceVal = (invoice && invoice[fieldName]) || 0;
    const fromState =
      fieldName === 'total'
        ? total
        : fieldName === 'storedInterest' && storedInterest;
    const trVal = fromState || transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${label}`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(invoiceVal).toLocaleString()}</Amount>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal).toLocaleString()}</Amount>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(trVal - invoiceVal).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderRowTr = (label, fieldName, isFromState?: any) => {
    let trVal = '';

    if (isFromState) {
      trVal = total.toString();
    } else trVal = paymentInfo?.[fieldName] || transaction[fieldName] || 0;

    if (!trVal) return '';

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

  const renderInfo = () => {
    if (!invoice) {
      return (
        <>
          <FormWrapper>
            <FormColumn>
              <ControlLabel>{__('Type')}</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel>Transaction</ControlLabel>
            </FormColumn>
          </FormWrapper>
          {renderRowTr('Total must pay', 'total')}
          {renderRowTr('Payment', 'payment')}
          {renderRowTr('Stored Interest', 'storedInterest')}
          {renderRowTr('Interest Nonce', 'calcInterest')}
          {renderRowTr('Commitment interest', 'commitmentInterest')}
          {renderRowTr('Loss', 'undue')}
          {renderRowTr('Insurance', 'insurance')}
          {renderRowTr('Debt', 'debt')}
        </>
      );
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>Type</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Invoice</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Transaction</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>Change</ControlLabel>
          </FormColumn>
        </FormWrapper>
        {renderRow('total', 'total')}
        {renderRow('payment', 'payment')}
        {renderRow('interest eve', 'storedInterest')}
        {renderRow('interest nonce', 'calcInterest')}
        {renderRow('Commitment interest', 'commitmentInterest')}

        {renderRow('undue', 'undue')}
        {renderRow('insurance', 'insurance')}
        {renderRow('debt', 'debt')}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, type } = props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      if (name === 'contractId') {
        setContractId(value);
      }
      if (name === 'customerId') {
        setCustomerId(value);
      }
      if (name === 'storedInterest') {
        setStoredInterest(value);
      }
    };

    const getPaymentInfo = (
      contractId,
      payDate: any = dayjs().locale('en').format('MMM, D YYYY'),
    ) => {
      client
        .mutate({
          mutation: gql(queries.getPaymentInfo),
          variables: { id: contractId, payDate: payDate },
        })
        .then(({ data }) => {
          setPaymentInfo(data.getPaymentInfo);
        });
    };

    const getCompanyName = (register) => {
      if (register && register.length === 7)
        client
          .query({
            query: gql(queries.getCompanyName),
            variables: { companyRd: register },
          })
          .then(({ data }) => {
            data?.ebarimtGetCompany?.info;
            setOrganizationName(data?.ebarimtGetCompany?.info?.name);
          });
    };

    const onChangePayDate = (value) => {
      if (contractId && payDate !== value) getPaymentInfo(contractId, value);

      setPayDate(value);
    };

    const onChangeField = (e) => {
      if ((e.target as HTMLInputElement).name === 'total' && paymentInfo) {
        const value = Number((e.target as HTMLInputElement).value);

        if (value > paymentInfo.closeAmount) {
          (e.target as HTMLInputElement).value = paymentInfo.closeAmount;
        }
      }
      if (
        (e.target as HTMLInputElement).name === 'organizationRegister' &&
        isOrganization &&
        isGetEBarimt
      ) {
        if ((e.target as HTMLInputElement).value.length > 7) return;
        if ((e.target as HTMLInputElement).value.length < 7) {
          setOrganizationName('');
        }
        getCompanyName((e.target as HTMLInputElement).value);
      }
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
      const name = (e.target as HTMLInputElement).name;
      if (name === 'description') {
        setDescription(value as any);
      }
      if (name === 'total') {
        setTotal(value as any);
      }
      if (name === 'isGetEBarimt') {
        setIsGetEBarimt(value as any);
      }
      if (name === 'isOrganization') {
        setIsOrganization(value as any);
      }
      if (name === 'organizationRegister') {
        setOrganizationRegister(value as any);
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

              <FormGroup>
                <ControlLabel>{__('Total')}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={'number'}
                  useNumberFormat
                  fixed={2}
                  name="total"
                  max={paymentInfo?.closeAmount}
                  value={total}
                  onChange={onChangeField}
                  onClick={onFieldClick}
                />
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
                      onSelect(Contracts[v].customerId, 'customerId');
                      onSelect(Contracts[v].storedInterest, 'storedInterest');
                    }

                    if (contractId !== v && type !== 'give')
                      getPaymentInfo(v, payDate);
                  }}
                  multi={false}
                />
              </FormGroup>
              {renderRowTr('Total', 'total', true)}
              {type !== 'give' && (
                <FormGroup>
                  <ControlLabel>{__('Is get E-Barimt')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={'checkbox'}
                    componentClass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isGetEBarimt"
                    value={isGetEBarimt}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Is organization')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={'checkbox'}
                    componentClass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isOrganization"
                    value={isOrganization}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && isOrganization && (
                <FormWrapper>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Organization Register')}</ControlLabel>
                      <FormControl
                        {...formProps}
                        type={'number'}
                        fixed={2}
                        name="organizationRegister"
                        value={organizationRegister}
                        onChange={onChangeField}
                        onClick={onFieldClick}
                      />
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Organization Name')}</ControlLabel>
                      <FormControl
                        {...formProps}
                        disabled
                        maxLength={7}
                        value={organizationName}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              )}
            </FormColumn>
          </FormWrapper>

          {type !== 'give' && renderInfo()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'transaction',
            values: generateDoc(values),
            isSubmitted,
            object: transaction,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
