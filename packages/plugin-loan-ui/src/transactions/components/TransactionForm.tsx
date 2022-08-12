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
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

const SelectCustomers = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "SelectCustomers" */ '@erxes/ui-contacts/src/customers/containers/SelectCustomers'
    )
);

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
      invoice: invoice || transaction.invoice || null
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
      contractId: this.state.contractId,
      invoiceId: this.state.invoiceId,
      ...this.state,
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

  renderRowTr = (label, fieldName) => {
    const { transaction } = this.props;

    const trVal = this.state[fieldName] || transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${label}:`}</ControlLabel>
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
              <ControlLabel>Type</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel>Transaction</ControlLabel>
            </FormColumn>
          </FormWrapper>
          {this.renderRowTr('total', 'total')}
          {this.renderRowTr('payment', 'payment')}
          {this.renderRowTr('interest eve', 'interestEve')}
          {this.renderRowTr('interest nonce', 'interestNonce')}
          {this.renderRowTr('undue', 'undue')}
          {this.renderRowTr('insurance', 'insurance')}
          {this.renderRowTr('debt', 'debt')}
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
        {this.renderRow('interest eve', 'interestEve')}
        {this.renderRow('interest nonce', 'interestNonce')}
        {this.renderRow('undue', 'undue')}
        {this.renderRow('insurance', 'insurance')}
        {this.renderRow('debt', 'debt')}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const transaction = this.props.transaction || ({} as ITransaction);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const onChangePayDate = value => {
      this.setState({ payDate: value });
    };

    const onChangeField = e => {
      this.setState({
        [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement)
          .value
      } as any);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Pay Date</ControlLabel>
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
                <ControlLabel>Description</ControlLabel>
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
                <ControlLabel>Total</ControlLabel>
                <FormControl
                  {...formProps}
                  type={'number'}
                  name="total"
                  value={this.state.total}
                  onChange={onChangeField}
                  onClick={this.onFieldClick}
                />
              </FormGroup>
            </FormColumn>

            <FormColumn>
              {isEnabled('contacts') && (
                <>
                  <FormGroup>
                    <ControlLabel>Company</ControlLabel>
                    <SelectCompanies
                      label="Choose an company"
                      name="companyId"
                      initialValue={this.state.companyId}
                      onSelect={onSelect}
                      multi={false}
                    />
                  </FormGroup>

                  <FormGroup>
                    <ControlLabel>Customer</ControlLabel>
                    <SelectCustomers
                      label="Choose an customer"
                      name="customerId"
                      initialValue={this.state.customerId}
                      onSelect={onSelect}
                      multi={false}
                    />
                  </FormGroup>
                </>
              )}

              {this.renderRowTr('total', 'total')}
            </FormColumn>
          </FormWrapper>

          {this.renderInfo()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
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
