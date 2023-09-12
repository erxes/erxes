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
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITransaction, ITransactionDoc } from '../types';

import { Amount } from '../../contracts/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IInvoice } from '../../invoices/types';
import React from 'react';
import { __ } from 'coreui/utils';
import SelectContracts, {
  Contracts
} from '../../contracts/components/common/SelectContract';
import dayjs from 'dayjs';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../graphql';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  invoice?: IInvoice;
  closeModal: () => void;
};

type State = {
  contractId: string;
  companyId: string;
  customerId: string;
  invoiceId: string;
  invoice?: IInvoice;
  payDate: Date;
  description: string;
  total: number;
  paymentInfo: any;
  isGetEBarimt?: boolean;
  isOrganization?: boolean;
  organizationRegister?: string;
  organizationName?: string;
  storedInterest: number;
};

class TransactionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { transaction = {}, invoice } = props;

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
      invoice: invoice || transaction.invoice || null,
      paymentInfo: null,
      storedInterest: 0
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
    const { invoice } = this.state;
    const invoiceVal = (invoice && invoice[fieldName]) || 0;
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

  renderRowTr = (label, fieldName, isFromState?: any) => {
    const { transaction } = this.props;
    const { paymentInfo } = this.state;
    let trVal = '';

    if (isFromState) {
      trVal = this.state[fieldName];
    } else trVal = paymentInfo?.[fieldName] || transaction[fieldName] || 0;

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

  renderInfo = () => {
    const { invoice } = this.state;
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
          {this.renderRowTr('Total must pay', 'total')}
          {this.renderRowTr('Payment', 'payment')}
          {this.renderRowTr('Stored Interest', 'storedInterest')}
          {this.renderRowTr('Interest Nonce', 'calcInterest')}
          {this.renderRowTr('Loss', 'undue')}
          {this.renderRowTr('Insurance', 'insurance')}
          {this.renderRowTr('Debt', 'debt')}
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
        {this.renderRow('total', 'total')}
        {this.renderRow('payment', 'payment')}
        {this.renderRow('interest eve', 'storedInterest')}
        {this.renderRow('interest nonce', 'calcInterest')}
        {this.renderRow('undue', 'undue')}
        {this.renderRow('insurance', 'insurance')}
        {this.renderRow('debt', 'debt')}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const getPaymentInfo = (
      contractId,
      payDate: any = dayjs()
        .locale('en')
        .format('MMM, D YYYY')
    ) => {
      client
        .mutate({
          mutation: gql(queries.getPaymentInfo),
          variables: { id: contractId, payDate: payDate }
        })
        .then(({ data }) => {
          this.setState({ paymentInfo: data.getPaymentInfo });
        });
    };

    const getCompanyName = register => {
      if (register && register.length === 7)
        client
          .query({
            query: gql(queries.getCompanyName),
            variables: { companyRd: register }
          })
          .then(({ data }) => {
            data?.ebarimtGetCompany?.info;
            this.setState({
              organizationName: data?.ebarimtGetCompany?.info?.name
            });
          });
    };

    const onChangePayDate = value => {
      if (this.state.contractId && this.state.payDate !== value)
        getPaymentInfo(this.state.contractId, value);

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
      if (
        (e.target as HTMLInputElement).name === 'organizationRegister' &&
        this.state.isOrganization &&
        this.state.isGetEBarimt
      ) {
        if ((e.target as HTMLInputElement).value.length > 7) return;
        if ((e.target as HTMLInputElement).value.length < 7) {
          this.setState({ organizationName: '' });
        }
        getCompanyName((e.target as HTMLInputElement).value);
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
                <ControlLabel>{__('Contract')}</ControlLabel>
                <SelectContracts
                  label={__('Choose an contract')}
                  name="contractId"
                  initialValue={this.state.contractId}
                  onSelect={(v, n) => {
                    onSelect(v, n);
                    if (typeof v === 'string') {
                      onSelect(Contracts[v].customerId, 'customerId');
                      onSelect(Contracts[v].storedInterest, 'storedInterest');
                    }

                    if (this.state.contractId !== v)
                      getPaymentInfo(v, this.state.payDate);
                  }}
                  multi={false}
                />
              </FormGroup>
              {this.renderRowTr('Total', 'total', true)}
              <FormGroup>
                <ControlLabel>{__('Is get E-Barimt')}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={'checkbox'}
                  componentClass="checkbox"
                  useNumberFormat
                  fixed={0}
                  name="isGetEBarimt"
                  value={this.state.isGetEBarimt}
                  onChange={onChangeField}
                  onClick={this.onFieldClick}
                />
              </FormGroup>
              {this.state.isGetEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Is organization')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={'checkbox'}
                    componentClass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isOrganization"
                    value={this.state.isOrganization}
                    onChange={onChangeField}
                    onClick={this.onFieldClick}
                  />
                </FormGroup>
              )}
              {this.state.isGetEBarimt && this.state.isOrganization && (
                <FormWrapper>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Organization Register')}</ControlLabel>
                      <FormControl
                        {...formProps}
                        type={'number'}
                        fixed={2}
                        name="organizationRegister"
                        value={this.state.organizationRegister}
                        onChange={onChangeField}
                        onClick={this.onFieldClick}
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
                        value={this.state.organizationName}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              )}
            </FormColumn>
          </FormWrapper>

          {this.renderInfo()}
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
