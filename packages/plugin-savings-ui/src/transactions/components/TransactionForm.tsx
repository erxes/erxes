import * as path from 'path';

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
import React from 'react';
import { __ } from 'coreui/utils';
import SelectContracts, {
  Contracts
} from '../../contracts/components/common/SelectContract';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../graphql';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  closeModal: () => void;
  type: string;
};

type State = {
  contractId: string;
  companyId: string;
  customerId: string;
  invoiceId: string;
  payDate: Date;
  description: string;
  total: number;
  paymentInfo: any;
  storedInterest: number;
  transactionType: string;
  closeInterest: number;
};

class TransactionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { transaction = {}, invoice, type } = props;

    this.state = {
      contractId:
        transaction.contractId || (invoice && invoice.contractId) || '',
      payDate:
        transaction.payDate || (invoice && invoice.payDate) || new Date(),
      invoiceId: transaction.invoiceId || (invoice && invoice._id) || '',
      description: transaction.description || '',
      total: transaction.total || (invoice && invoice.total) || 0,
      companyId: transaction.companyId || (invoice && invoice.companyId) || '',
      customerId:
        transaction.customerId || (invoice && invoice.customerId) || '',
      paymentInfo: null,
      storedInterest: 0,
      transactionType: type,
      closeInterest: 0
    };
  }

  generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const { transaction } = this.props;

    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      isManual: true,
      payDate: finalValues.payDate,
      total: Number(this.state.total)
    };
  };

  onFieldClick = e => {
    e.target.select();
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  renderRow = (label, fieldName) => {
    const { transaction } = this.props;
    const invoiceVal = 0;
    const trVal = this.state[fieldName] || transaction[fieldName] || 0;

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

  renderRowTr = (label, fieldName) => {
    let trVal = this.state[fieldName];

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

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const onChangePayDate = value => {
      this.setState({ payDate: value });
    };

    const onChangeField = e => {
      if (
        (e.target as HTMLInputElement).name === 'total' &&
        this.state.paymentInfo
      ) {
        const value = Number((e.target as HTMLInputElement).value);

        if (value > this.state.paymentInfo.closeAmount) {
          (e.target as HTMLInputElement).value = this.state.paymentInfo.closeAmount;
        }
      }
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
      this.setState({
        [(e.target as HTMLInputElement).name]: value
      } as any);
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
                    value={this.state.payDate}
                    onChange={onChangePayDate}
                  />
                </DateContainer>
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Contract')}</ControlLabel>
                <SelectContracts
                  label={__('Choose an contract')}
                  name="contractId"
                  initialValue={this.state.contractId}
                  onSelect={(v, n) => {
                    onSelect(v, n);
                    if (typeof v === 'string') {
                      onSelect(Contracts[v].customerId, 'customerId');
                      this.setState({
                        storedInterest: Contracts[v].storedInterest,
                        closeInterest: Contracts[v].closeInterest,
                        interestRate: Contracts[v].interestRate,
                        savingAmount: Contracts[v].interestRate
                      });
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
                  max={this.state?.paymentInfo?.closeAmount}
                  value={this.state.total}
                  onChange={onChangeField}
                  onClick={this.onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Description')}</ControlLabel>
                <DateContainer>
                  <FormControl
                    {...formProps}
                    required={false}
                    name="description"
                    value={this.state.description}
                    onChange={onChangeField}
                  />
                </DateContainer>
              </FormGroup>
              {this.state.transactionType === 'outcome' && (
                <Info type="danger" title="Анхаар">
                  Зарлага хийх үед хүүгийн буцаалт хийгдэж гэрээ цуцлагдахыг
                  анхаарна уу
                </Info>
              )}
              {this.state.transactionType === 'outcome' &&
                this.renderRowTr('savingAmount', 'savingAmount')}
              {this.state.transactionType === 'outcome' &&
                this.renderRowTr('storedInterest', 'storedInterest')}
              {this.state.transactionType === 'outcome' &&
                this.renderRowTr('closeInterest', 'closeInterest')}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'transaction',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.transaction
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default TransactionForm;
